export const ALL_PROJECTS_QUERY = `
  *[ _type == 'story' ] { slug }
`

export const PROJECT_QUERY = (project) => `
*[
    _type == 'story' && slug.current == '${project}'
  ]{
    slug {
      current
    },
    title,
    network_metadata {
      asset ->
    },
    story_chapters[] {
      chapter_title,
      snapshot_date,
      networks {
        source_network_id,
        source_network_name,
        source_network_shapefile {
          asset ->
        },
        target_network_id,
        target_network_name,
        target_network_shapefile {
          asset ->
        }
      },
      blocks[] {
        network_control,
        block_title,
        block_content[] {
          ...,
          _type == 'story.chart' => {
            ...,
            dataset {
              ...,
              asset ->
            }
          }
        },
      }
    }
  }
`

export default PROJECT_QUERY
