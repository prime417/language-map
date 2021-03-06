import { Map } from 'mapbox-gl'
import { WebMercatorViewport } from 'react-map-gl'

import * as MapTypes from './types'
import * as config from './config'

// NOTE: Firefox needs SVG width/height to be explicitly set on the SVG in order
// for this to work.
// CRED:
// https://github.com/mapbox/mapbox-gl-js/issues/5529#issuecomment-465403194
export const addLangTypeIconsToMap = (
  map: Map,
  iconsConfig: MapTypes.LangIconConfig[]
): void => {
  iconsConfig.forEach((iconConfig) => {
    const { id, icon } = iconConfig

    if (map && map.hasImage(id)) {
      map.removeImage(id)
    }

    // CRED:
    // https://github.com/mapbox/mapbox-gl-js/issues/5529#issuecomment-340011876
    const img = new Image(48, 48) // src files are 24x24 viewbox

    // Enabling the `sdf` property allows icons to be colored on the fly:
    // https://docs.mapbox.com/help/troubleshooting/using-recolorable-images-in-mapbox-maps/#mapbox-gl-js
    img.onload = () => map.addImage(id, img, { sdf: true })
    img.src = icon
  })
}

// Includes
export const filterLayersByFeatIDs = (
  map: Map,
  layerNames: string[],
  langFeatIDs: number[]
): void => {
  layerNames.forEach((name) => {
    // CRED: https://gis.stackexchange.com/a/287629/5824
    const filterLangsByID = ['in', ['get', 'ID'], ['literal', langFeatIDs]]
    const currentFilters = map.getFilter(name)

    let origFilter = []
    let filterToUse = filterLangsByID

    // TODO: consider usefulness, otherwise remove: `map.getLayer(name)`
    map.setFilter(name, null) // clear it first // TODO: rm if not necessary

    // GROSS dude. Gotta be a better way to check?
    if (currentFilters && currentFilters[0] === 'all') {
      ;[, origFilter] = currentFilters
    } else if (currentFilters) {
      // Irrelevant for labels layers since no init filters at time of writing:
      origFilter = currentFilters
    }

    // TODO: tighten this up!
    if (!['Language', 'Endonym'].includes(name)) {
      filterToUse = ['all', origFilter, filterLangsByID]
    }

    map.setFilter(name, filterToUse)
  })
}

export const getWebMercViewport: MapTypes.GetWebMercViewport = (params) => {
  const { width, height, bounds, padding } = params

  return new WebMercatorViewport({
    width,
    height,
  }).fitBounds(bounds, padding ? { padding } : {})
}

export const asyncAwaitFetch = async (path: string): Promise<void> =>
  (await fetch(path)).json()

export const prepPopupContent: MapTypes.PrepPopupContent = (
  selFeatAttribs,
  popupHeading
) => {
  if (popupHeading) return { heading: popupHeading }
  if (!selFeatAttribs) return null

  const { Endonym, Language, 'Font Image Alt': altImage } = selFeatAttribs

  return {
    heading: altImage ? Language : Endonym,
    subheading: altImage || Endonym === Language ? '' : Language,
  }
}

export const flyToBounds: MapTypes.FlyToBounds = (
  map,
  { height, width, bounds },
  popupContent
) => {
  let popupSettings = null

  const webMercViewport = new WebMercatorViewport({
    width,
    height,
  }).fitBounds(bounds, { padding: 50 })
  const { latitude, longitude, zoom } = webMercViewport

  if (popupContent) popupSettings = { latitude, longitude, ...popupContent }

  map.flyTo({ essential: true, zoom, center: [longitude, latitude] }, {
    forceViewportUpdate: true,
    popupSettings,
  } as MapTypes.CustomEventData)
}

export const flyToPoint: MapTypes.FlyToPoint = (
  map,
  {
    latitude,
    longitude,
    zoom: targetZoom,
    disregardCurrZoom,
    bearing = 0,
    pitch = 0,
  },
  popupContent,
  geocodeMarkerText
) => {
  let zoom = targetZoom
  let popupSettings = null

  const currentZoom = map.getZoom()

  // Only zoom to the default if current zoom is higher than that
  if (disregardCurrZoom && currentZoom > targetZoom) zoom = currentZoom
  if (popupContent) popupSettings = { latitude, longitude, ...popupContent }

  const customEventData = {
    forceViewportUpdate: true,
    popupSettings,
  } as MapTypes.CustomEventData

  if (geocodeMarkerText) {
    customEventData.geocodeMarker = {
      longitude,
      latitude,
      text: geocodeMarkerText,
    }
  }

  map.flyTo(
    { essential: true, zoom, center: [longitude, latitude], bearing, pitch },
    customEventData
  )
}

export const langFeatsUnderClick: MapTypes.LangFeatsUnderClick = (
  point,
  map,
  interactiveLayerIds
) => {
  return map.queryRenderedFeatures(
    [
      [point[0] - 5, point[1] - 5],
      [point[0] + 5, point[1] + 5],
    ],
    {
      layers: interactiveLayerIds.lang,
    }
  )
}

export const clearBoundaries: MapTypes.ClearStuff = (map) => {
  map.removeFeatureState({
    source: config.neighSrcId,
    sourceLayer: config.neighPolyID,
  })
  // }, 'hover') // NOTE: could not get this to work properly anywhere

  map.removeFeatureState({
    source: config.countiesSrcId,
    sourceLayer: config.countiesPolyID,
  })
}

// Convert a Google Sheets API response into Mapbox font filters. For it to have
// any impact, the fonts must be uploaded to the Mapbox account and their names
// must be identical to those in the sheet.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const prepEndoFilters = (data: MapTypes.SheetsValues[]): any[] => {
  // Skip the first row, which contains only column headings
  const filters = data.slice(1).reduce((all, row) => {
    const lang = ['==', ['var', 'lang'], row[0]]
    const font = ['literal', [row[1]]]

    return [...all, lang, font]
  }, [] as any[])

  return [
    'let',
    'lang',
    ['get', 'Language'],
    [
      'case',
      ...filters,
      ['literal', ['Noto Sans Regular', 'Arial Unicode MS Regular']],
    ],
  ]
}
/* eslint-enable @typescript-eslint/no-explicit-any */
