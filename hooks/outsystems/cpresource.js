module.exports = function (ctx) {
  var Q = ctx.requireCordovaModule("q");
  var fs = ctx.requireCordovaModule("fs");
  var path = ctx.requireCordovaModule("path");
  var CordovaError = ctx.requireCordovaModule("cordova-common").CordovaError;
  var deferral = Q.defer();

  function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", done);

    var wr = fs.createWriteStream(target);
    wr.on("error", done);
    wr.on("close", function (ex) {
      done();
    });
    rd.pipe(wr);

    function done(err) {
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      }
    }
  }

  var projectRoot = ctx.opts.projectRoot;
  var androidPath = path.join(projectRoot, "platforms", "android");
  var wwwpath = path.join(androidPath, "assets/www");
  var configPath = path.join(wwwpath, "google-services");
  var googleServiceFile = path.join(configPath, "google-services.json");

  if (fs.existsSync(googleServiceFile)) {
    copyFile(googleServiceFile, path.join(androidPath, "google-services.json"), function (err) {
      if (err !== undefined) {
        deferral.reject(new CordovaError("Failed to copy google-services.json file..."));
        return;
      }
      deferral.resolve();
    });

  } else {
    deferral.reject(new CordovaError("google-services.json file not found under google-services folder in the resources."));
  }

  return deferral.promise;
};
