import React, { FC, useContext, useEffect, useState } from 'react'
import { Dialog } from '@material-ui/core'

import { GlobalContext, DialogCloseBtn, SlideUp } from 'components'
import { useStyles } from './styles'
import { CloseTableProps } from './types'
import { ResultsTable } from './ResultsTable'
import { LangRecordSchema } from '../../context/types'

type ResultsModalProps = CloseTableProps & { open: boolean; mapLoaded: boolean }

export const ResultsModal: FC<ResultsModalProps> = (props) => {
  const { open, closeTable, mapLoaded } = props
  const classes = useStyles()
  const { state } = useContext(GlobalContext)
  const [tableData, setTableData] = useState<LangRecordSchema[]>([])
  const [oneAndDone, setOneAndDone] = useState<boolean>(false)

  useEffect((): void => {
    if (oneAndDone || !state.langFeatures.length) return
    if (!oneAndDone) setOneAndDone(true)

    setTableData([...state.langFeatures])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.langFeatures])
  const handleClose = (): void => closeTable()

  return (
    <Dialog
      open={open}
      keepMounted={mapLoaded}
      TransitionComponent={SlideUp}
      className={`${classes.resultsModalRoot}`}
      onClose={handleClose}
      aria-labelledby="results-modal-dialog-title"
      aria-describedby="results-modal-dialog-description"
      maxWidth="lg"
      PaperProps={{ className: classes.resultsModalPaper }}
    >
      <DialogCloseBtn onClose={closeTable} tooltip="Exit to map" />
      <ResultsTable closeTable={closeTable} data={tableData} />
    </Dialog>
  )
}
