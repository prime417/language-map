import React, { FC } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Typography, Box } from '@material-ui/core'
import {
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  CloseReason,
} from '@material-ui/lab'
import { MdMoreVert, MdClose } from 'react-icons/md'
import { BiMapPin } from 'react-icons/bi'
import { FiHome, FiZoomIn, FiZoomOut, FiInfo } from 'react-icons/fi'

import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'

import { MapCtrlBtnsProps, CtrlBtnConfig } from './types'
import { GeocoderPopout } from './GeocoderPopout'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapCtrlsRoot: {
      position: 'absolute',
      top: theme.spacing(1),
      right: 4, // same as left-side page title
      zIndex: 1100, // above app bar
      [theme.breakpoints.up('sm')]: {
        top: theme.spacing(3),
        right: theme.spacing(3),
      },
      '& svg': {
        height: '1.5em',
        width: '1.5em',
      },
    },
    speedDialAction: {
      margin: 4,
      '&:hover': {
        [theme.breakpoints.down('sm')]: {
          backgroundColor: theme.palette.background.default,
        },
      },
    },
    popoverContent: {
      padding: '1em',
      width: 300,
    },
    popoverContentHeading: {
      marginTop: '.5rem',
    },
    popoverContentText: {
      marginBottom: '.75em',
      fontSize: '0.8em',
    },
    layersMenuPaper: {
      overflow: 'visible',
    },
    locationBtnWrap: {
      display: 'flex',
      justifyContent: 'center',
    },
  })
)

const ctrlBtnsConfig = [
  { id: 'in', icon: <FiZoomIn />, name: 'Zoom in' },
  { id: 'out', icon: <FiZoomOut />, name: 'Zoom out' },
  { id: 'home', icon: <FiHome />, name: 'Zoom home' },
  {
    id: 'loc-search',
    icon: <BiMapPin />,
    name: 'Search by location',
    customFn: true,
  },
  { id: 'info', icon: <FiInfo />, name: 'About & Info' },
] as CtrlBtnConfig[]

export const LocationSearchContent: FC = (props) => {
  const { children } = props
  const classes = useStyles()

  return (
    <Box className={classes.popoverContent}>
      <Typography variant="h5" component="h3">
        Search by location
      </Typography>
      <Typography className={classes.popoverContentText}>
        <small>
          Enter an address, municipality, neighborhood, postal code, landmark,
          or other point of interest. Note that this project's focus is on the
          New York City metro area and surrounding locations, so no communities
          will be found outside that extent.
        </small>
      </Typography>
      {children}
    </Box>
  )
}

export const MapCtrlBtns: FC<MapCtrlBtnsProps> = (props) => {
  const { isDesktop, onMapCtrlClick, mapRef, mapOffset } = props
  const classes = useStyles()
  const [speedDialOpen, setSpeedDialOpen] = React.useState(true)
  const size = isDesktop ? 'medium' : 'small'
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleSpeedDialRootClick = () => setSpeedDialOpen(!speedDialOpen)

  const handleClose = (
    e: React.SyntheticEvent<Record<string, unknown>, Event>,
    reason: CloseReason
  ) => {
    if (reason === 'mouseLeave' || reason === 'blur') {
      // Prevent closing the menu
      e.preventDefault()

      return
    }

    setSpeedDialOpen(false)
  }

  return (
    <>
      <GeocoderPopout {...{ anchorEl, setAnchorEl, mapOffset, mapRef }} />
      <SpeedDial
        ariaLabel="Map control buttons"
        className={classes.mapCtrlsRoot}
        icon={<SpeedDialIcon openIcon={<MdClose />} icon={<MdMoreVert />} />}
        onClose={handleClose}
        open={speedDialOpen}
        direction="down"
        FabProps={{ size }}
        onClick={handleSpeedDialRootClick}
      >
        {ctrlBtnsConfig.map((action) => (
          <SpeedDialAction
            className={classes.speedDialAction}
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            FabProps={{ size }} // TODO: uhhhh breakpoints? Why is this needed?
            onClick={(e) => {
              e.stopPropagation() // prevent closing the menu

              // GROSS
              if (!action.customFn) {
                onMapCtrlClick(action.id)
              } else {
                setAnchorEl(e.currentTarget)
              }
            }}
          />
        ))}
      </SpeedDial>
    </>
  )
}
