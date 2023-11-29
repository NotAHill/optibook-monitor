function findUsernameWithMaxHourlyPnl(data) {
    const maxHourlyPnlIndex = data.hourly_pnl.reduce(
      (maxIndex, current, index, array) => {
        return parseFloat(current) > parseFloat(array[maxIndex])
          ? index
          : maxIndex;
      },
      0
    );
  
    return data.users[maxHourlyPnlIndex];
  }
  
  const instruments = [
    "CSCO", "ING", "NVDA", "NVDA_202403_050C", "NVDA_202403_050P",
    "NVDA_202403_075C", "NVDA_202403_075P", "NVDA_202403_100C",
    "NVDA_202403_100P", "NVDA_202403_F", "NVDA_202406_F", "NVDA_202409_F",
    "NVDA_DUAL", "OB5X_202403_080C", "OB5X_202403_080P", "OB5X_202403_100C",
    "OB5X_202403_100P", "OB5X_202403_120C", "OB5X_202403_120P",
    "OB5X_202403_F", "OB5X_202406_F", "OB5X_202409_F", "PFE", "SAN",
    "SAN_DUAL"
  ];
  
  for (const inst of instruments) {
    var node = document.createElement("li");
    node.setAttribute("id", inst);
    document.getElementById("instruments").appendChild(node);
  }
  
  setInterval(function () {
    fetch("http://localhost:3000")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        for (const inst in data) {
          var username = findUsernameWithMaxHourlyPnl(data[inst]);
          var listItem = document.getElementById(inst);
          var str = `${inst}\n${username}`;
          listItem.innerHTML = str;
  
          // Remove previous color class
          listItem.classList.remove("green", "red");
  
          // Add new color class based on the username
          if (username !== "team-001") {
            listItem.classList.add("red");
          } else {
            listItem.classList.add("green");
          }
        }
      });
  }, 1000);
  