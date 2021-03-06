import React, { FC } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Backdrop, CircularProgress, Typography } from '@material-ui/core'

import { useStyles as useNavStyles } from 'components/nav/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdropRoot: {
      color: '#fff',
      flexDirection: 'column',
      textAlign: 'center',
      zIndex: theme.zIndex.drawer + 1,
    },
    backdropContent: {
      position: 'absolute',
      top: 'calc(25% - 30px)',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
        top: 'calc(50% - 50px)',
      },
    },
    text: {
      textShadow: '1px 1px 5px #444',
      marginBottom: theme.spacing(1),
    },
  })
)

export const LoadingBackdrop: FC = () => {
  const classes = useStyles()
  const navClasses = useNavStyles({ panelOpen: true })

  return (
    <Backdrop className={classes.backdropRoot} open>
      <div className={classes.backdropContent}>
        <div
          className={`${navClasses.spacerDesktop} ${navClasses.spacerLeft}`}
        />
        <div>
          <Typography variant="h4" component="h2" className={classes.text}>
            Loading...
          </Typography>
          <CircularProgress color="inherit" size={38} />
        </div>
        <div className={navClasses.spacerDesktop} />
      </div>
    </Backdrop>
  )
}
