/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popover from '@material-ui/core/Popover';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { useAsync } from '@react-hookz/web';
import Cancel from '@material-ui/icons/Cancel';
import Retry from '@material-ui/icons/Repeat';
import Toc from '@material-ui/icons/Toc';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import MoreVert from '@material-ui/icons/MoreVert';
import React, { useState } from 'react';
import { useAnalytics, useApi } from '@backstage/core-plugin-api';
import { scaffolderApiRef } from '@backstage/plugin-scaffolder-react';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  taskCancelPermission,
  taskReadPermission,
  taskCreatePermission,
} from '@backstage/plugin-scaffolder-common/alpha';

type ContextMenuProps = {
  cancelEnabled?: boolean;
  logsVisible?: boolean;
  buttonBarVisible?: boolean;
  onStartOver?: () => void;
  onToggleLogs?: (state: boolean) => void;
  onToggleButtonBar?: (state: boolean) => void;
  taskId?: string;
};

const useStyles = makeStyles<Theme, { fontColor: string }>(() => ({
  button: {
    color: ({ fontColor }) => fontColor,
  },
}));

export const ContextMenu = (props: ContextMenuProps) => {
  const {
    cancelEnabled,
    logsVisible,
    buttonBarVisible,
    onStartOver,
    onToggleLogs,
    onToggleButtonBar,
    taskId,
  } = props;
  const { getPageTheme } = useTheme();
  const pageTheme = getPageTheme({ themeId: 'website' });
  const classes = useStyles({ fontColor: pageTheme.fontColor });
  const scaffolderApi = useApi(scaffolderApiRef);
  const analytics = useAnalytics();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();

  const [{ status: cancelStatus }, { execute: cancel }] = useAsync(async () => {
    if (taskId) {
      analytics.captureEvent('cancelled', 'Template has been cancelled');
      await scaffolderApi.cancelTask(taskId);
    }
  });

  // Used dummy string value for `resourceRef` since `allowed` field will always return `false` if `resourceRef` is `undefined`
  const { allowed: canCancelTask } = usePermission({
    permission: taskCancelPermission,
    resourceRef: 'task',
  });

  const { allowed: canReadTask } = usePermission({
    permission: taskReadPermission,
    resourceRef: 'task',
  });

  const { allowed: canCreateTask } = usePermission({
    permission: taskCreatePermission,
    resourceRef: 'task',
  });

  // Cancel endpoint requires user to have both read and cancel permissions
  const cancelNotAllowed = !(canReadTask && canCancelTask);

  // Start Over endpoint requires user to have both read (to grab parameters) and create (to create new task) permissions
  const canStartOver = canReadTask && canCreateTask;

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={(event: React.SyntheticEvent<HTMLButtonElement>) => {
          setAnchorEl(event.currentTarget);
        }}
        data-testid="menu-button"
        className={classes.button}
      >
        <MoreVert />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(undefined)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          <MenuItem onClick={() => onToggleLogs?.(!logsVisible)}>
            <ListItemIcon>
              <Toc fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={logsVisible ? 'Hide Logs' : 'Show Logs'} />
          </MenuItem>
          <MenuItem onClick={() => onToggleButtonBar?.(!buttonBarVisible)}>
            <ListItemIcon>
              <ControlPointIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={buttonBarVisible ? 'Hide Button Bar' : 'Show Button Bar'}
            />
          </MenuItem>
          <MenuItem
            onClick={onStartOver}
            disabled={cancelEnabled || !canStartOver}
            data-testid="start-over-task"
          >
            <ListItemIcon>
              <Retry fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Start Over" />
          </MenuItem>
          <MenuItem
            onClick={cancel}
            disabled={
              !cancelEnabled ||
              cancelStatus !== 'not-executed' ||
              cancelNotAllowed
            }
            data-testid="cancel-task"
          >
            <ListItemIcon>
              <Cancel fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Cancel" />
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
};
