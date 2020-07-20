const fs = require("fs"),
      d3 = require("d3");

fs.readFile("./schoolData.csv", "utf8", function(error, data) {
  if (error) throw error;
  data = d3.csvParse(data);
  schools = [];
  data.forEach(function(d) {
    let datum = {};
    for (column in data.columns) {
      if (column == 0) {
        datum.school = d[data.columns[0]];
      } else if (column == 1) {
        datum[data.columns[1]] = d[data.columns[1]];
      } else {
        datum[data.columns[column]] = +d[data.columns[column]];
      }
    }
    schools.push(datum);
  });

  fs.writeFile("./data.csv", d3.csvFormat(schools), function(error) {
    console.log("./data.csv written");

    fs.readFile("./data.csv", "utf8", function(error, data) {
      if (error) throw error;
      data = d3.csvParse(data);

      newData = d3.nest()
        .key(function(d) { return d.school; })
        .entries(data);

      finalData = {
        type: "FeatureCollection",
        features: []
      };

      newData.forEach(function(d) {
        d.school = d.values[0].school;
        d.type = d.values[0].type;
        d.lng = +d.values[0].lng;
        d.lat = +d.values[0].lat;
        delete d.key;
        d.values.forEach(function(e) {
          delete e.school;
          delete e.type;
          delete e.lng;
          delete e.lat;
          for (key in d3.keys(e)) {
            e[d3.keys(e)[key]] = +e[d3.keys(e)[key]];
          };
        });

        finalData.features
          .push({
            type: "Feature",
            properties: {
              school: d.school,
              type: d.type,
              data: d.values
            },
            geometry: {
              type: "Point",
              coordinates: [d.lng, d.lat]
            }
          });
      });

      fs.writeFile("./schoolData.geojson", JSON.stringify(finalData), function(error) {
        console.log("./schoolData.geojson written");
      });
    });
  });
});
