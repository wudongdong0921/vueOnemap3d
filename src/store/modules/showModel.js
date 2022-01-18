const showModel = {
  state: {
    floodModelFlag: false,
    floodTerrainFlag: false,
    visibilityFlag: false,
    visibleFlag: false,
    illuminationFlag: false,
    skylineFlag: false,
    openDegreeFlag: false,
    profileFlag: false,
    excavationFlag: false,
    videoFlag: false,
    slopeFlag: false
  },
  mutations: {
    hadleFlood(state, data) {
      state.floodModelFlag = data;
    },
    handleFloodTetrn(state, data) {
      state.floodTerrainFlag = data;
    },
    handleVisibility(state, data) {
      state.visibilityFlag = data;
    },
    handleVisibleRange(state, data) {
      state.visibleFlag = data;
    },
    handleIlluminationFlag(state,data) {
        state.illuminationFlag = data
    },
    handleSkylineFlag(state,data) {
        state.skylineFlag = data
    },
    handleOpenDegreeFlag(state,data) {
        state.openDegreeFlag = data
    },
    handleProfileFlag(state,data) {
        state.profileFlag = data
    },
    handleExcavationFlag(state,data) {
        state.excavationFlag = data
    },
    handleVideoFlag(state,data) {
        state.videoFlag = data
    },
    handleSlopeFlag(state,data) {
        state.slopeFlag = data
    }
  }
};
export default showModel;
