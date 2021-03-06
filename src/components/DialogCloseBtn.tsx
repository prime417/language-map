import React, { FC } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { IconButton } from '@material-ui/core'
import { MdClose } from 'react-icons/md'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeBtnRoot: {
      color: theme.palette.text.primary,
      padding: 4,
      position: 'absolute',
      right: 4,
      top: 8,
      zIndex: 12, // magic Z
      [theme.breakpoints.up('sm')]: {
        right: 8,
      },
    },
  })
)

type DialogCloseBtnComponent = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClose: any // it's fine, not sure what type of function
  tooltip?: string
}

export const DialogCloseBtn: FC<DialogCloseBtnComponent> = (props) => {
  const classes = useStyles()
  const { onClose, tooltip } = props

  return (
    <IconButton
      onClick={onClose}
      className={classes.closeBtnRoot}
      title={tooltip}
    >
      <MdClose />
    </IconButton>
  )
}
