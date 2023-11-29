const WebSocket = require("ws");
const cors = require('cors');

// URL of the WebSocket server
const wsUrl = "wss://icl-b-1.optibook.net/visualizer/optibook/ws";

var hasDoc = false;
var tabsId = null;
var selectId = null;
var options = null;
var selectedOption = 0;
var global_data_store = {};
var uid = 0;
function token(session_id = "PCLOUD", session_expiry = Date.now() + 300) {
  return btoa(JSON.stringify({ session_id, session_expiry })).replace(
    /=+$/,
    ""
  );
}

// Create a WebSocket client instance
const wsClient = new WebSocket(wsUrl, ["bokeh", token()]);

wsClient.on("open", function open() {
  console.log("Connected to the server.");
});

wsClient.on("message", function message(data) {
  // switch the state to WAITING_PATCH_DOC after receiving a message like this
  // {"msgid": "304531", "msgtype": "ACK"}
  var dataObj = null;
  try {
    dataObj = JSON.parse(data);
  } catch (e) {
    return;
  }
  if (dataObj === undefined) {
    return;
  }
  if (dataObj.msgtype === "ACK") {
    wsClient.send(JSON.stringify({ msgid: "PCLOUD", msgtype: "PULL-DOC-REQ" }));
    wsClient.send(JSON.stringify({}));
    wsClient.send(JSON.stringify({}));
  }
  if (dataObj.doc !== undefined) {
    hasDoc = true;
    const r = dataObj.doc.roots.references;
    for (const obj of r) {
      if (obj.type === "Tabs") {
        console.log("Found Tabs");
        tabsId = obj.id;
      }
      if (obj.type === "Select") {
        if (obj.attributes.options.length > 5) {
          console.log("Found Select");
          selectId = obj.id;
          options = obj.attributes.options;
        }
      }
    }
    // {"msgid":"F02B2EA16D484A6284A4B43AE2FF3C6C","msgtype":"PATCH-DOC"}
    // {}
    // {"events":[{"kind":"ModelChanged","model":{"id":"442342"},"attr":"active","new":1}],"references":[]}
    wsClient.send(JSON.stringify({ msgid: "PCLOUD", msgtype: "PATCH-DOC" }));
    wsClient.send(JSON.stringify({}));
    wsClient.send(
      JSON.stringify({
        events: [
          {
            kind: "ModelChanged",
            model: { id: tabsId },
            attr: "active",
            new: 1,
          },
        ],
        references: [],
      })
    );
    return;
  }
  if (dataObj.events) {
    const event = dataObj.events[0];
    if (event?.new?.rank) {
      console.log(options[selectedOption]);
      console.log(findUsernameWithMaxHourlyPnl(event.new));
      global_data_store[options[selectedOption]] = event.new;

      wsClient.send(JSON.stringify({ msgid: "PCLOUD", msgtype: "PATCH-DOC" }));
      wsClient.send(JSON.stringify({}));
      wsClient.send(
        JSON.stringify({
          events: [
            {
              kind: "ModelChanged",
              model: { id: selectId },
              attr: "value",
              new: options[selectedOption],
            },
          ],
          references: [],
        })
      );
      selectedOption++;
      if (selectedOption >= options.length) {
        selectedOption = 0;
      }
    }
  }
});

wsClient.on("error", function error(err) {
  console.error("WebSocket error:", err);
});

wsClient.on("close", function close(code, reason) {
  console.log("Disconnected from the server.");
  console.log("Code:", code, "Reason:", reason.toString());
});

function findUsernameWithMaxHourlyPnl(data) {
  // Find the index of the maximum hourly P&L
  const maxHourlyPnlIndex = data.hourly_pnl.reduce(
    (maxIndex, current, index, array) => {
      return parseFloat(current) > parseFloat(array[maxIndex])
        ? index
        : maxIndex;
    },
    0
  );

  // Use the index to find the corresponding username
  const usernameWithMaxHourlyPnl = data.users[maxHourlyPnlIndex];

  return usernameWithMaxHourlyPnl;
}

const express = require("express");
const app = express();
const port = 3000;
app.use(cors());

app.get("/", (req, res) => {
    console.log(global_data_store)
  res.send(global_data_store);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
