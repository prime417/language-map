import React, { FC, useContext, useEffect, useState } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'

import { GlobalContext, ScrollToTopOnMount } from 'components'
import { LegendPanel } from 'components/legend'
import { initLegend } from 'components/legend/utils'
import {
  useSymbAndLabelState,
  useLabelAndSymbDispatch,
} from '../../context/SymbAndLabelContext'
import { SearchByOmnibox } from './SearchByOmnibox'
import { LangRecordSchema } from '../../context/types'
import { FiltersWarning } from './FiltersWarning'
import symbLayers from '../map/config.lang-style'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    panelContentHeading: {
      marginTop: '0.65em',
      marginBottom: '0.25em',
    },
  })
)

export const FiltersPanel: FC = () => {
  const { state } = useContext(GlobalContext)
  const symbLabelState = useSymbAndLabelState()
  const symbLabelDispatch = useLabelAndSymbDispatch()
  const classes = useStyles()
  const [data, setData] = useState<LangRecordSchema[]>([])
  const elemID = 'filters-panel'
  const { activeSymbGroupID, legendItems } = symbLabelState

  useEffect((): void => {
    initLegend(symbLabelDispatch, activeSymbGroupID, symbLayers)
  }, [activeSymbGroupID, symbLabelDispatch])

  useEffect((): void => setData(state.langFeatures), [state.langFeatures])

  // TODO: something respectable for styles, aka MUI-something
  return (
    <>
      {state.panelState === 'default' && <ScrollToTopOnMount elemID={elemID} />}
      <Typography variant="h5" component="h3" id={elemID}>
        Search language communities
      </Typography>
      <SearchByOmnibox data={data} />
      {state.langFeatsLenCache !== state.langFeatures.length && (
        <FiltersWarning />
      )}
      <Typography
        className={classes.panelContentHeading}
        variant="h5"
        component="h3"
      >
        Legend
      </Typography>
      <LegendPanel legendItems={legendItems} groupName={activeSymbGroupID} />
    </>
  )
}
