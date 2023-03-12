const eventEmitterBuilder = require("./globalEventEmitter");
const { notifications } = require("./notificationWS");

const eventEmitter = new eventEmitterBuilder().getInstance();

const portResponse = (portData) => {
  switch (portData.slice(2, 6)) {
    case 'JRTK':
      if (portData.split(',')[2] === 'FAILED') {
        eventEmitter.emit("notification", "setPositionFailed");
        notifications.push({ status: 'error', section: 'configPosition', message: 'تغییر مختصات با خطا روبرو شد دوباره تلاش کنید' })
      } else {
        eventEmitter.emit("notification", { status: 'success', section: 'configPosition', message: 'تغییر مختصات با موفقیت انجام شد', data: { lat: portData.split(',')[2], lon: portData.split(',')[3], alt: portData.split(',')[4] } });
        notifications.push({ status: 'success', section: 'configPosition', message: 'تغییر مختصات با موفقیت انجام شد', data: { lat: portData.split(',')[2], lon: portData.split(',')[3], alt: portData.split(',')[4] } });
      }
      break;

    default:
      break;
  }
}

module.exports = portResponse