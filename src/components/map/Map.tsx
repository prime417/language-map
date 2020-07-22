import React, { FC, useState, useContext, useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import queryString from 'query-string'
import MapGL, { Source, Layer } from 'react-map-gl'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// eslint-disable-next-line import/no-extraneous-dependencies
import 'mapbox-gl/dist/mapbox-gl.css'

import { GlobalContext } from 'components'
import { MapPopup } from 'components/map'
import { MAPBOX_TOKEN } from '../../config'
import { LangRecordSchema } from '../../context/types'
import {
  InitialMapState,
  MapEventType,
  LongLatType,
  LayerPropsPlusMeta,
} from './types'
import { prepMapPadding } from './utils'
import {
  createMapLegend,
  getMbStyleDocument,
  shouldOpenPopup,
} from '../../utils'
import { langLayerConfig, langSrcConfig } from './config'

const MB_STYLES_API_URL = 'https://api.mapbox.com/styles/v1'

export const Map: FC<InitialMapState> = ({ latitude, longitude, zoom }) => {
  const theme = useTheme()
  const { state, dispatch } = useContext(GlobalContext)
  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom,
    pitch: 0,
    bearing: 0,
  })
  const [symbLayers, setSymbLayers] = useState<LayerPropsPlusMeta[]>([])
  const [labelLayers, setLabelLayers] = useState<LayerPropsPlusMeta[]>([])
  const [popupAttribs, setPopupAttribs] = useState<LangRecordSchema>()
  const { activeLangSymbGroupId, activeLangLabelId } = state
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  // TODO: mv popup stuff into reducer
  const [popupOpen, setPopupOpen] = useState<boolean>(false)
  const [popupSettings, setPopupSettings] = useState<LongLatType>({
    longitude: 0,
    latitude: 0,
  })

  useEffect(() => {
    const symbStyleUrl = `${MB_STYLES_API_URL}/${langLayerConfig.styleUrl}?access_token=${MAPBOX_TOKEN}`

    getMbStyleDocument(
      symbStyleUrl,
      dispatch,
      setSymbLayers,
      setLabelLayers
    ).catch((errMsg) => {
      // TODO: wire up sentry
      // eslint-disable-next-line no-console
      console.error(
        `Something went wrong trying to fetch MB style JSON: ${errMsg}`
      )
    })
  }, [dispatch])

  useEffect(() => {
    const layersInActiveGroup = symbLayers.filter(
      (layer: LayerPropsPlusMeta) =>
        layer.metadata['mapbox:group'] === activeLangSymbGroupId
    )

    const legend = createMapLegend(layersInActiveGroup)

    dispatch({
      type: 'SET_LANG_LAYER_LEGEND',
      payload: legend,
    })
  }, [activeLangSymbGroupId, symbLayers, dispatch])

  return (
    <MapGL
      {...viewport}
      width="100%"
      height="100%"
      onViewportChange={setViewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle={`mapbox://styles/mapbox/${state.baselayer}-v9`}
      // TODO: show MB attribution text (not logo) on mobile
      className="mb-language-map"
      onClick={(event: MapEventType): void => {
        const { features, lngLat } = event

        if (!shouldOpenPopup(features, langSrcConfig.internalSrcID)) {
          setPopupOpen(false)

          return
        }

        setPopupOpen(true)
        setPopupSettings({
          latitude: lngLat[1],
          longitude: lngLat[0],
        })
        setPopupAttribs(features[0].properties)
      }}
      onHover={(event: MapEventType): void => {
        const { features, target } = event

        if (!shouldOpenPopup(features, langSrcConfig.internalSrcID)) {
          target.style.cursor = 'default'
        } else {
          target.style.cursor = 'pointer'
        }
      }}
      onLoad={(map) => {
        const rawLangFeats = map.target.querySourceFeatures(
          langSrcConfig.internalSrcID,
          {
            sourceLayer: langSrcConfig.layerId,
          }
        )
        const parsed = queryString.parse(window.location.search)
        const padding = prepMapPadding(isDesktop)

        // NOTE: could not get padding to work with `flyTo` or `easeTo` or any
        // related methods, so using this instead.
        map.target.setPadding(padding)
        map.target.on('zoomend', (mapObj) => {
          if (mapObj.updateViewportState) {
            const { target } = mapObj

            setViewport({
              zoom: target.getZoom(),
              pitch: target.getPitch(),
              bearing: target.getBearing(),
              latitude: target.getCenter().lat,
              longitude: target.getCenter().lng,
            })
          }
        })

        // TODO: tighten up query params via TS
        // TODO: make it all reusable, including `flyTo`, for route changes
        if (parsed && parsed.id) {
          const matchingRecord = rawLangFeats.find((feature) => {
            const featAttribs = feature.properties as LangRecordSchema

            return featAttribs.ID === parsed.id
          })

          if (matchingRecord) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const coords = matchingRecord.toJSON().geometry.coordinates
            const newZoom = 14

            map.target.flyTo(
              {
                // this animation is considered essential with respect to
                // prefers-reduced-motion
                essential: true,
                center: [coords[0], coords[1]],
                zoom: newZoom,
              },
              {
                updateViewportState: true,
              }
            )
          }
        }

        // Just the properties for table/results, etc. Don't need the cruft from
        // geojson.
        // TODO: could `matchingRecord` be found within the `.map` here to reduce looping/iteration of `.find`?
        const featsWithAttribsOnly = rawLangFeats.map(
          ({ properties }) => properties
        )

        dispatch({
          type: 'INIT_LANG_LAYER_FEATURES',
          payload: featsWithAttribsOnly as LangRecordSchema[],
        })
      }}
    >
      {popupOpen && popupAttribs && (
        <MapPopup
          {...popupSettings}
          setPopupOpen={setPopupOpen}
          popupOpen={popupOpen}
          popupAttribs={popupAttribs}
        />
      )}
      {/* NOTE: it did not seem to work when using two different Styles with the same dataset unless waiting until there is something to put into <Source> */}
      {symbLayers.length && labelLayers.length && (
        <Source
          type="vector"
          url={`mapbox://${langSrcConfig.tilesetId}`}
          id={langSrcConfig.internalSrcID}
        >
          {symbLayers.map((layer: LayerPropsPlusMeta) => {
            const isInActiveGroup =
              layer.metadata['mapbox:group'] === activeLangSymbGroupId

            return (
              <Layer
                key={layer.id}
                {...layer}
                // TODO: some kind of transition/animation on switch
                layout={{
                  visibility: isInActiveGroup ? 'visible' : 'none',
                }}
              />
            )
          })}
          {labelLayers.map((layer: LayerPropsPlusMeta) => {
            const isActiveLabel = layer.id === activeLangLabelId

            // TODO: some kind of transition/animation on switch
            const layout = {
              ...layer.layout,
              visibility: isActiveLabel ? 'visible' : 'none',
            }

            return (
              <Layer
                key={layer.id}
                id={layer.id}
                type={layer.type}
                source={layer.source}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                source-layer={layer['source-layer']}
                paint={layer.paint}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                layout={layout}
              />
            )
          })}
        </Source>
      )}
    </MapGL>
  )
}
