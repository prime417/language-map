import React, { FC } from 'react'
import {
  makeStyles,
  createStyles,
  useTheme,
  Theme,
} from '@material-ui/core/styles'
import { MdCheck } from 'react-icons/md'
import { GoCircleSlash } from 'react-icons/go'

import { LegendSwatch } from 'components/legend'
import { useSymbAndLabelState } from '../../context/SymbAndLabelContext'
import { LangRecordSchema } from '../../context/types'

type CellProps = { data: LangRecordSchema }

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    disabled: {
      color: theme.palette.text.secondary,
    },
  })
)

export const VideoColumnCell: FC<CellProps> = (props) => {
  const classes = useStyles()
  const { data } = props
  const { Video: video } = data

  return (
    <div className={classes.disabled} style={{ paddingLeft: 16 }}>
      {video ? <MdCheck /> : <GoCircleSlash />}
    </div>
  )
}

export const GlobalSpeakers: FC<CellProps> = (props) => {
  const classes = useStyles()
  const { data } = props

  if (!data['Global Speaker Total']) return null

  return (
    // Right-aligned number w/left-aligned column heading was requested
    <div className={classes.disabled} style={{ paddingRight: 16 }}>
      {data['Global Speaker Total'].toLocaleString()}
    </div>
  )
}

export const CommStatus: FC<CellProps> = (props) => {
  const classes = useStyles()
  const { data } = props

  return <div className={classes.disabled}>{data.Status}</div>
}

export const CommSize: FC<{
  data: LangRecordSchema
  lookup: { [key: number]: string }
}> = (props) => {
  const symbLabelState = useSymbAndLabelState()
  const theme = useTheme()
  const { data, lookup } = props
  const valAsPrettyStr = lookup[data.Size]
  const swatchColor =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    symbLabelState.legendSymbols[valAsPrettyStr].paint['icon-color'] as string

  return (
    <LegendSwatch
      legendLabel={valAsPrettyStr}
      component="div"
      iconID="_circle"
      backgroundColor={swatchColor || 'transparent'}
      labelStyleOverride={{
        lineHeight: 'inherit',
        marginLeft: 2,
        color: theme.palette.text.secondary,
        fontSize: 'inherit',
      }}
    />
  )
}

export const WorldRegion: FC<CellProps> = (props) => {
  const { data } = props
  const { 'World Region': WorldReej } = data
  const symbLabelState = useSymbAndLabelState()

  const regionSwatchColor =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    symbLabelState.legendSymbols[WorldReej].paint['icon-color'] as string

  return (
    <LegendSwatch
      legendLabel={WorldReej}
      component="div"
      iconID="_circle"
      backgroundColor={regionSwatchColor || 'transparent'}
      labelStyleOverride={{
        lineHeight: 'inherit',
        marginLeft: 2,
        fontSize: 'inherit',
      }}
    />
  )
}
