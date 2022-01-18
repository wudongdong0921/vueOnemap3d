<template>
  <div class="ala-menu-wrapper">
    <div class="ala-menu-box">
      <div class="menu-title">
        <span>三维分析</span>
        <!-- <span class="close">X</span> -->
      </div>
      <ul class="menu-ul">
        <li class="menu-item" v-for="(item, index) in menuList" :key="index">
          <a href="#"
             @click="showFlood(item)">
            <img class="menu-left-img"
                 src="@/assets/img/map/u207.png"
                 alt="" />
            <div class="menu-right-desc">
              <div class="title">{{item.title}}</div>
              <p class="desc">{{item.desc}}</p>
            </div>
          </a>
        </li>
      </ul>
    </div>
    <!-- <div id="cesiumContainer"></div> -->
    <div>
      <flood-model v-if="floodModelFlag" ref="hadleFlood"></flood-model>
      <flood-terrain v-if="floodTerrainFlag" ref="handleFloodTetrn"></flood-terrain>
      <visibility v-if="visibilityFlag" ref="handleVisibility"></visibility>
      <visible-range v-if="visibleFlag" ref="handleVisibleRange"></visible-range>
      <illumination v-if="illuminationFlag" ref="handleIlluminationFlag"></illumination>
      <skyline v-if="skylineFlag" ref="handleSkylineFlag"></skyline>
      <open-degree v-if="openDegreeFlag" ref="handleOpenDegreeFlag"></open-degree>
      <profile v-if="profileFlag" ref="handleProfileFlag"></profile>
      <excavation v-if="excavationFlag" ref="handleExcavationFlag"></excavation>
      <videoOn v-if="videoFlag" ref="videoFlag"></videoOn>
      <slope-view v-if="slopeFlag" ref="handleSlopeFlag"></slope-view>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import WebglAnalyse from '@components/webgl3d/initWebgl'
import alaMenu from '@/views/webglAnalyse/alaMenu/index'
import floodModel from '@/views/webglAnalyse/flood/flood-model'
import floodTerrain from '@/views/webglAnalyse/flood/flood-terrain'
import visibility from '@/views/webglAnalyse/visibility/index'
import visibleRange from '@/views/webglAnalyse/visible-range/index'
import illumination from '@/views/webglAnalyse/illumination/index'
import skyline from '@/views/webglAnalyse/skyline/index'
import openDegree from '@/views/webglAnalyse/open-degree/index'
import profile from '@/views/webglAnalyse/profile/index'
import excavation from '@/views/webglAnalyse/excavation/index'
import videoOn from '@/views/webglAnalyse/video-on/index'
import slopeView from '@/views/webglAnalyse/slope-view/index'
const menuList = [
    {
        title: "淹没模型分析",
        desc: "对三维进行分析",
        type: true,
        handler: "hadleFlood"
    },{
        title: "淹没地形分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleFloodTetrn"
    },{
        title: "通视分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleVisibility"
    },{
        title: "可视域分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleVisibleRange"
    },{
        title: "光照分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleIlluminationFlag"
    },{
        title: "天际线分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleSkylineFlag"
    },{
        title: "开敞度分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleOpenDegreeFlag"
    },{
        title: "剖面分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleProfileFlag"
    },{
        title: "坡度坡向分析",
        desc: "对三维进行分析",
        type: true,
        handler: "handleSlopeFlag"
    },{
        title: "地形开挖",
        desc: "对三维进行分析",
        type: true,
        handler: "handleExcavationFlag"
    }
]
export default {
    data() {
        return {
            menuList: menuList
        }
    },
  components: {
    floodModel,
    floodTerrain,
    visibility,
    visibleRange,
    illumination, //光照分析
    skyline, //天际线
    openDegree, //开敞度
    profile, //剖面
    excavation, //地形开挖
    videoOn, //视频投放
    slopeView,
    alaMenu
  },
  computed: {
    ...mapState({
      floodModelFlag: state => state.showModel.floodModelFlag,
      floodTerrainFlag: state => state.showModel.floodTerrainFlag,
      visibilityFlag: state => state.showModel.visibilityFlag,
      visibleFlag: state => state.showModel.visibleFlag,
      illuminationFlag: state => state.showModel.illuminationFlag,
      skylineFlag: state => state.showModel.skylineFlag,
      openDegreeFlag: state => state.showModel.openDegreeFlag,
      profileFlag: state => state.showModel.profileFlag,
      excavationFlag: state => state.showModel.excavationFlag,
      videoFlag: state => state.showModel.videoFlag,
      slopeFlag: state => state.showModel.slopeFlag
    })
  },
  mounted() {
      this._WebglAnalyse = new WebglAnalyse()
  },
  methods: {
    ...mapMutations([
      'hadleFlood',
      'handleFloodTetrn',
      'handleVisibility',
      'handleVisibleRange',
      'handleIlluminationFlag',
      'handleSkylineFlag',
      'handleOpenDegreeFlag',
      'handleProfileFlag',
      'handleExcavationFlag',
      'handleVideoFlag',
      'handleSlopeFlag'
    ]),
    showFlood(item) {
        var list = this.menuList
        for(let i =0;i<list.length;i++) {
            this[list[i].handler](false)
            
            if(item.handler == list[i].handler) {
                this[item.handler](true)
                //item.type && this._WebglAnalyse.pushHandle(this.$refs[item.handler].clear)
                console.log(this.$refs[item.handler])
                //item.type && 
                item.type = false
                this._WebglAnalyse.init()
            }
            this.$refs[item.handler] && this.$refs[item.handler].clearBtn()
        }
   
  }
  }
}
</script>

<style>
.ala-menu-wrapper .ala-menu-box{
  position: absolute;
  top: 94px;
  bottom: 30px;
  left: 20px;
  z-index: 9999;
  width: 300px;
  min-height: 80%;
  height: 80%;
}
/* .ala-menu-box {
  width: 100%;
  height: 100%;
} */
.ala-menu-box .menu-ul {
  padding: 16px 10px;
  height: 100%;
  overflow-y: auto;
  background: #fff;
}
.ala-menu-box .menu-ul .menu-item {
  border-bottom: solid 1px #ddd;
  padding: 10px 0;
}
.ala-menu-box .menu-ul .menu-item .menu-left-img {
  display: inline-block;
  vertical-align: top;
}
.ala-menu-box .menu-ul .menu-item .menu-right-desc {
  display: inline-block;
  text-align: left;
  padding: 0 10px;
}
.ala-menu-box .menu-ul .menu-item .menu-right-desc .title {
  font-size: 18px;
  color: #333;
}
.ala-menu-box .menu-ul .menu-item .menu-right-desc .desc {
  color: #8c8c8c;
}
.ala-menu-box .menu-title {
  position: relative;
  width: 100%;
  height: 44px;
  line-height: 44px;
  padding: 0 10px;
  background: rgba(30, 74, 146);
  color: #fff;
}
.ala-menu-box .menu-title .close {
  position: absolute;
  right: 30px;
}
#cesiumContainer{
  position: fixed;
    top: 0;
    left: 0px;
    right: 0;
    height: 100%;

}
</style>
