import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import Link from 'next/link'

import { getPlant, getPlantList, getCategoryList } from '@api'

import { Layout } from '@components/Layout'
import { Typography } from '@ui/Typography'
import { Grid } from '@ui/Grid'

import { RichText } from '@components/RichText'
import { AuthorCard } from '@components/AuthorCard'
import { PlantEntryInline } from '@components/PlantCollection'
import { useRouter } from 'next/dist/client/router'

type PlantEntryProps = {
  plant: Plant | null
  otherEntries: Plant[] | null
  categories: Category[] | null
}

export const getStaticProps: GetStaticProps<PlantEntryProps> = async ({
  params,
}) => {
  const slug = params?.slug
  if (typeof slug !== 'string') {
    return {
      notFound: true,
    }
  }
  try {
    const plant = await getPlant(slug)
    const otherEntries = await getPlantList({ limit: 5 })
    const categories = await getCategoryList({ limit: 10 })

    return {
      props: {
        plant,
        otherEntries,
        categories,
      },
      revalidate: 5 * 60, //REFRESH EACH 5 MIN
    }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  type PathType = {
    params: {
      slug: string
    }
  }
  const entries = await getPlantList({ limit: 10 })
  const paths: PathType[] = entries.map((entry) => ({
    params: {
      slug: entry.slug,
    },
  }))
  return {
    paths,
    //fallback: false RETURN 404 IF THE SLUG DO NOT EXIST
    //fallback: 'blocking' BLOCK THE PAGE UNTIL LOAD IT
    //fallback: true YO CAN MANAGE THE STATE TO SHOW A LOADING
    fallback: true,
  }
}

export default function PlantEntryPage({
  plant,
  otherEntries,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  
  const router = useRouter()
  if (router.isFallback) {
    <Layout>
    <main>Loading...</main>
  </Layout>
  }
  ]
  if (plant == null) {
    return (
      <Layout>
        <main>404, Not found</main>
      </Layout>
    )
  }
  return (
    <Layout>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8} lg={9} component="article">
          <figure>
            <img width={592} src={plant.image.url} />
          </figure>
          <div className="px-12 pt-8">
            <Typography variant="h2">{plant.plantName}</Typography>
          </div>
          <div className="p-10">
            <RichText richText={plant.description} />
          </div>
        </Grid>
        <Grid item xs={12} md={4} lg={3} component="aside">
          <section>
            <Typography variant="h5" component="h3" className="mb-4">
              Recent post
            </Typography>
            {otherEntries?.map((entry) => (
              <article className="mb-4" key={entry.id}>
                <PlantEntryInline {...entry} />
              </article>
            ))}
          </section>
          <section>
            <Typography variant="h5" component="h3" className="mb-4">
              Categories
            </Typography>

            <ul className="list">
              {categories?.map((category) => (
                <Link passHref href={`/category/${category.slug}`}>
                  <Typography component="a" variant="h6">
                    {category.title}
                  </Typography>
                </Link>
              ))}
            </ul>
          </section>
        </Grid>
      </Grid>
      <section className="my-4 border-t-2 border-b-2 border-gray-200 pt-12 pb-7">
        <AuthorCard {...plant.author} />
      </section>
    </Layout>
  )
}
