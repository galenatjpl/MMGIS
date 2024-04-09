import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {} from "./MainSlice";
import { makeStyles } from "@mui/styles";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import HandymanIcon from "@mui/icons-material/Handyman";
import ExploreIcon from "@mui/icons-material/Explore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";

import { calls } from "../../core/calls";
import { setConfiguration, setSnackBarText } from "../../core/ConfigureStore";

import Home from "../Tabs/Home/Home";
import Layers from "../Tabs/Layers/Layers";
import UserInterface from "../Tabs/UserInterface/UserInterface";

const useStyles = makeStyles((theme) => ({
  Main: {
    width: "100%",
    height: "100%",
    background: theme.palette.swatches.grey[1000],
    boxShadow: `inset 10px 0px 10px -5px rgba(0,0,0,0.3)`,
  },
  tabPage: {
    width: "100%",
    height: "calc(100% - 49px)",
    overflowY: "auto",
  },
  topbar: {
    width: "100%",
    height: "48px",
    minHeight: "48px",
    display: "flex",
    justifyContent: "space-between",
    background: theme.palette.swatches.grey[150],
    boxShadow: `inset 10px 0px 10px -5px rgba(0,0,0,0.3)`,
    borderBottom: `1px solid ${theme.palette.swatches.grey[700]} !important`,
  },
  activeMission: {
    lineHeight: "28px",
    fontSize: "18px",
    margin: "10px 10px 10px 10px",
    color: theme.palette.swatches.p[3],
    letterSpacing: "1.5px",
    padding: "0px 8px",
    background: theme.palette.swatches.grey[50],
  },
  tabs: {
    "& > div": {
      borderRight: "none",
      height: "48px",
      minHeight: "48px",
    },
    "& .MuiTab-root": {
      color: theme.palette.swatches.grey[500],
      height: "48px",
      minHeight: "48px",
      padding: "0px 24px",
      fontSize: "13px",
      textTransform: "none",
      borderBottom: `none !important`,
    },
    "& .MuiTab-root.Mui-selected": {
      background: theme.palette.swatches.grey[900],
      color: theme.palette.swatches.grey[100],
      fontWeight: "bold",
    },

    "& .MuiTabs-indicator": {
      background: theme.palette.swatches.p[0],
    },
  },
}));

export default function Main() {
  const c = useStyles();

  const dispatch = useDispatch();
  const mission = useSelector((state) => state.core.mission);

  useEffect(() => {
    if (mission != null)
      calls.api(
        "get",
        { mission: mission },
        (res) => {
          dispatch(setConfiguration(res));
        },
        (res) => {
          dispatch(
            setSnackBarText({
              text: res?.message || "Failed to get configuration for mission.",
              severity: "error",
            })
          );
        }
      );
  }, [dispatch, mission]);

  const [tabValue, setTabValue] = useState(0);

  let TabPage = null;
  switch (tabValue) {
    case 0:
      TabPage = <Home />;
      break;
    case 1:
      TabPage = <Layers />;
      break;
    case 2:
    case 3:
    case 4:
      TabPage = (
        <div>
          {mission} {tabValue}
        </div>
      );
      break;
    case 5:
      TabPage = <UserInterface />;
      break;
    default:
  }

  return (
    <div className={c.Main}>
      <div className={c.topbar}>
        <div className={c.activeMission}>{mission}</div>
        <div className={c.tabs}>
          <Tabs
            variant="scrollable"
            value={tabValue}
            onChange={(e, val) => {
              setTabValue(val);
            }}
            sx={{ borderRight: 1, borderColor: "divider" }}
          >
            <Tab icon={<HomeIcon />} iconPosition="start" label="Home" />
            <Tab icon={<LayersIcon />} iconPosition="start" label="Layers" />
            <Tab icon={<HandymanIcon />} iconPosition="start" label="Tools" />
            <Tab
              icon={<ExploreIcon />}
              iconPosition="start"
              label="Coordinates"
            />
            <Tab icon={<AccessTimeIcon />} iconPosition="start" label="Time" />
            <Tab
              icon={<ViewQuiltIcon />}
              iconPosition="start"
              label="User Interface"
            />
          </Tabs>
        </div>
      </div>
      <div className={c.tabPage}>{TabPage}</div>
    </div>
  );
}
