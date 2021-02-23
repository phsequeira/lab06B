const getLocationId = ({ location }, locations) => locations.find(location === location.place).id;

module.exports = {
  getLocationId
};