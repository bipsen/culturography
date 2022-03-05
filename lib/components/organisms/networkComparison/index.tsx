import { useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SingleNetwork = dynamic(
  () => import('components/molecules/singleNetwork'),
  { ssr: false }
)
const NetworkComparisonAnnouncer = dynamic(
  () => import('components/molecules/networkComparisonAnnouncer'),
  { ssr: false }
)

//
import { motionOptions } from '@/const/motionProps'
import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'

import Legend from 'components/molecules/legend'
import { motion } from 'framer-motion'

const networkNames = ['source', 'target']

const NetworkComparison = ({ data }) => {
  const [layout, dispatch] = useVizLayout()
  //
  // story properties
  const { networks: networksProperties } = layout
  const { block } = layout.story
  // net properties
  const networksData = data.story_chapters[layout.story.chapter]
  // const targetNetworkName = networksData.networks.target_network_name
  //
  // clusters properties
  const rawClusterId = +layout.networks.nameHighlight
  const activeClusterId: number = isNaN(rawClusterId) ? null : rawClusterId
  //
  const clusterIdMatch = (c: ClusterObjectProps) =>
    c.cluster_id == activeClusterId

  const activeCluster: ClusterObjectProps = activeClusterId
    ? layout?.clusters.find(clusterIdMatch)
    : null

  // layout properties
  const showBothNetworks =
    networksProperties.source.show && networksProperties.target.show

  useEffect(() => {
    const fetchMetadata = async () => {
      let dataset

      try {
        const metadata = data.network_metadata.asset

        dataset = await fetch(`https://api.sanity.io/${metadata.path}`).then(
          (r) => r.json()
        )
      } catch {
        const { source_network_id, target_network_id } = networksData.networks

        dataset =
          await require(`../../../../public/data/${source_network_id}_${target_network_id}_clusters.json`)
      }

      return dataset
    }

    const updateMetadata = (metadata) => {
      dispatch({
        type: 'UPDATE_STORY_METADATA',
        payload: { metadata },
      })
    }

    fetchMetadata().then(updateMetadata)
  }, [data.network_metadata.asset])

  const networkLayoutProperties = useCallback(
    (source) => {
      const show = source
        ? networksProperties.source.show
        : networksProperties.target.show

      const width = showBothNetworks ? '49.5%' : show ? '85%' : '49.5%'
      const zIndex = showBothNetworks ? 1 : show ? 2 : 1
      const scale = show ? 1 : 0.9
      const opacity = showBothNetworks || show ? 1 : 0.05
      const transformOrigin = source ? '100% 50% 0px' : '0% 50% 0px'
      const x = source ? (show ? 0 : -20) : show ? 0 : 0

      return {
        show: show,
        animate: {
          zIndex: zIndex,
          width: width,
          left: source
            ? '0%'
            : showBothNetworks
            ? '50.5%'
            : show
            ? '20%'
            : '50.5%',
          x: x,
          scale: scale,
          opacity: opacity,
        },
        style: {
          transformOrigin: transformOrigin,
        },
      }
    },
    [block]
  )

  return (
    <motion.div
      className="fixed top-[var(--nav-height)] bottom-0 left-0 right-0"
      initial={false}
      transition={motionOptions}
    >
      <div className="relative h-full px-2">
        {layout.clusters && (
          <div className="relative h-[calc(100%-0.5rem)] flex">
            {/*  */}
            <Legend />
            {/*  */}
            {networkNames.map((n) => {
              const isSource = n === 'source'
              const { animate, style } = networkLayoutProperties(isSource)
              return (
                <motion.div
                  key={n}
                  className="absolute inset-0 w-1/2 rounded-lg overflow-hidden bg-black flex flex-1 justify-center items-center"
                  layout
                  initial={false}
                  animate={animate}
                  transition={{
                    type: 'spring',
                    stiffness: 800,
                    damping: 60,
                  }}
                  style={style}
                >
                  <SingleNetwork
                    data={networksData}
                    activeCluster={activeCluster}
                    activeClusterId={activeClusterId}
                    accessor={n}
                  />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default NetworkComparison
