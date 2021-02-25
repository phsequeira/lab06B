const getLocationId = ({ where }, locations) => locations.find(location => where === location.place).id;

module.exports = {
  getLocationId
};