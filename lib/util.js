var util = {
  humanizeBytes: function(bytes) {
    var G = 1 << 30;
    var M = 1 << 20;
    var K = 1 << 10;

    if (bytes >= G) return (Math.round(bytes / G * 100) / 100) + " GB";
    if (bytes >= M) return (Math.round(bytes / M * 100) / 100) + " MB";
    if (bytes >= K) return (Math.round(bytes / K * 100) / 100) + " KB";
    return bytes + " bytes";
  }
}

module.exports = util;