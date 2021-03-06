import React, { FC } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Typography, Badge } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    filtersWarning: {
      fontSize: '0.7em',
      marginLeft: 6,
      lineHeight: 0.8,
      color: theme.palette.text.secondary,
    },
    fabBadge: {
      backgroundColor: theme.palette.warning.light,
    },
  })
)

// Let user know that they are searching filtered data
export const FiltersWarning: FC = () => {
  const classes = useStyles()

  return (
    <Badge
      variant="dot"
      color="secondary"
      classes={{ dot: classes.fabBadge }}
      style={{ marginLeft: 8 }}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Typography className={classes.filtersWarning} component="span">
        Filters in the Data Table will affect results.
      </Typography>
    </Badge>
  )
}
