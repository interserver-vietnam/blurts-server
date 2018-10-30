"use strict";

const fetch = require("node-fetch");
const fs = require("fs");
const svg2png = require("svg2png");
const mozlog = require("./log");
const log = mozlog("breach-images");

const breachImages = {

  makeLogoListForEmails() {
    const emailLogos = [];
    const images = fs.readdirSync("./public/img/logos/");
    images.forEach(file => {
      if (file.endsWith(".png")) {
        emailLogos.push(file);
      }
    });
    return emailLogos;
  },

  makePNG(breachName) {
    const svgLogo = fs.readFileSync(`./public/img/logos/${breachName}.svg`);
    const pngLogo = svg2png.sync(svgLogo, {width: 150});
    fs.writeFile(`./public/img/logos/${breachName}.png`, pngLogo, (err) => {
      if(err) {
        log.info(`Error converting ${breachName} logo to PNG`);
      }
      log.info(`${breachName} PNG logo saved.`);
    });
  },


  getNewBreachImage(breachName, breachLogoType) {
    const breachLogo = `${breachName}.${breachLogoType}`;
    fetch(`https://haveibeenpwned.com/Content/Images/PwnedLogos/${breachLogo}`)
      .then(res => {
        return new Promise((resolve, reject) => {
          const dest = fs.createWriteStream(`./public/img/logos/${breachLogo}`);
          res.body.pipe(dest);
          res.body.on("error", err =>{
            reject(err);
          });
          dest.on("finish", () => {
            if(breachLogoType === "svg") {
              log.info(`${breachName} SVG logo saved.`);
              resolve(this.makePNG(breachName));
            }
            resolve();
          });
          dest.on("error", err => {
            reject(err);
          });
        });
      });
    },
};

module.exports = breachImages;
