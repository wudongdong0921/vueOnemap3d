<!-- 坡度坡向 -->
<template>
  <div class="visible_range_wrapper">
    <div id="cesiumContainer"></div>
    <div id="toolba1r"
         style="position : absolute;left : 15px; top : 15px;display : none;">
      <button type="button"
              id="clear"
              class="button black">清除</button>
    </div>
    <!-- <div id="split"
         style="background-image:url('./images/splitShow.gif'); width: 13px;height: 72px;top: 8px"
         title="功能模块"></div> -->
    <div id="float"
         v-if="floatFlag"
         class="param-container tool-bar">
      <div id="con"
           style="width: 230px;top: 85px;left: 1.1%;margin: 10px">
        <label for="calMode">1、计算模式：</label>
        <el-select class="wdd-bottom"
                   v-model="calMode"
                   placeholder="请选择"
                   @change="changeCalMode">
          <el-option v-for="item in mode"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value">
          </el-option>
        </el-select><br>
        <!-- <select id="calMode"
                v-model="calMode"
                @change="changeCalMode">
          <option v-for="(item,index) in mode"
                  :key="index"
                  :value="item.value">{{item.label}}</option>
        </select><br> -->
        <label>2、坡度区间：</label>
        <label> 起：</label>
        <input type="range"
               id="wideminR"
               min="0"
               max="90"
               :value="wideminR"
               @change="changeWideminR($event)"
               style="width: 150px">
        <input type="number"
               id="widemin"
               :value="wideminR"
               @change="changeWideminR($event)"
               min="0"
               max="90"
               style="width: 40px"> <br><label> 终：</label><br>
        <input type="range"
               id="widemaxR"
               :value="widemaxR"
               @change="changeWidemaxR($event)"
               min="0"
               max="90"
               style="width: 150px">
        <input type="number"
               id="widemax"
               min="0"
               max="90"
               :value="widemaxR"
               @change="changeWidemaxR($event)"
               style="width: 40px;">
        <label>3、显示样式：</label>
        <el-radio-group v-model="radio"
                        @change="changeRadio"
                        :text-color="textColor"
                        :fill="fill">
          <el-radio :label="3">显示填充颜色</el-radio>
          <el-radio :label="6">显示坡向箭头</el-radio>
          <el-radio :label="9">填充颜色和坡向箭头</el-radio>
        </el-radio-group>
        <!-- <label><input type="radio"
                 id="showcolor"
                 name="fill">显示填充颜色</label>
        <label><input type="radio"
                 id="showarrow"
                 name="fill">显示坡向箭头</label>
        <label><input type="radio"
                 id="showall"
                 name="fill"
                 checked="checked">填充颜色和坡向箭头</label> -->
        <label>4、颜色条带：</label>
        <div id="bar">
          <el-dropdown trigger="click"
                       style="width: 220px;"
                       @command="handleCommand">
            <span class="el-dropdown-link wdd-span"
                  :class="band">
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1"><span class='label band1'></span></el-dropdown-item>
              <el-dropdown-item command="2"><span class='label band2'></span></el-dropdown-item>
              <el-dropdown-item command="3"><span class='label band3'></span></el-dropdown-item>
              <el-dropdown-item command="4"><span class='label band4'></span></el-dropdown-item>
              <el-dropdown-item command="5"><span class='label band5'></span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- <select id="colorTable1"
          v-model="colorTable1"
          @change="changeColorTable1"
                  class="selectpicker">
            <option value="1"
                    data-content=""><span class='label band4'>1</span></option>
            <option value="2"
                    data-content=""><span class='label band2'>2</span></option>
            <option value="3"
                    data-content=""><span class='label band3'>3</span></option>
            <option value="4"
                    data-content=""><span class='label band1'>4</span></option>
            <option value="5"
                    data-content=""><span class='label band5'>5</span></option>
          </select> -->
        </div>
        <br>
        <label>5、透明调节：</label>
        <input type="number"
               step="0.1"
               id="trans"
               min="0"
               max="1"
               @change="changeTrans($event)"
               :value="trans"
               style="width:100px">
        <el-button @click="clearBtn"
                   type="primary">清除结果</el-button>
        <!-- <input type="button"
               id="cance"
               @click="handleCance"
               value="清除结果"> -->
      </div>
    </div>
  </div>
</template>

<script>
import { createTooltip } from '@/assets/js/tooltip.js'
const mode = [
  {
    label: '指定多边形区域',
    value: '0'
  },
  {
    label: '全部区域参与分析',
    value: '1'
  },
  {
    label: '全部区域不参与分析',
    value: '2'
  }
]
export default {
  data() {
    return {
      band: 'band1',
      textColor: '#333',
      fill: '#333',
      radio: 9,
      floatFlag: false,
      mode: mode,
      wideminR: 0,
      widemaxR: 78,
      colorTable1: '1',
      trans: 0.5,
      calMode: '0',
      color: 'rgba(19, 206, 102, 0.8)',
      colorH: '#rgba(19, 206, 102, 0.8)',
      wrapperFlag: false,
      viewer: null,
      scene: null,
      colorTable: null,
      handlerPolygon: null,
      slope: null,
      wide: null
    }
  },
  mounted() {
    let that = this
    var viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: URL_CONFIG.ZF_TERRAIN2,
        isSct: true, //地形服务源自SuperMap iServer发布时需设置isSct为true
        requestVertexNormals: true
      })
    })

    //添加SuperMap iServer发布的影像服务
    viewer.imageryLayers.addImageryProvider(
      new Cesium.SuperMapImageryProvider({
        url: URL_CONFIG.ZF_IMG2
      })
    )

    var scene = viewer.scene
    scene.globe.enableLighting = true
    viewer.scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(87.1, 27.8, 8000.0),
      orientation: {
        heading: 6.10547067016156,
        pitch: -0.8475077031996778,
        roll: 6.2831853016686185
      }
    })
    var slope = new Cesium.SlopeSetting()
    slope.DisplayMode = Cesium.SlopeSettingEnum.DisplayMode.FACE_AND_ARROW
    slope.MaxVisibleValue = this.widemaxR
    slope.MinVisibleValue = this.wideminR
    var colorTable = new Cesium.ColorTable()
    colorTable.insert(80, new Cesium.Color(255 / 255, 0 / 255, 0 / 255))
    colorTable.insert(50, new Cesium.Color(221 / 255, 224 / 255, 7 / 255))
    colorTable.insert(30, new Cesium.Color(20 / 255, 187 / 255, 18 / 255))
    colorTable.insert(20, new Cesium.Color(0, 161 / 255, 1))
    colorTable.insert(0, new Cesium.Color(9 / 255, 9 / 255, 255 / 255))
    var wide
    wide = Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_REGION
    slope.ColorTable = colorTable
    slope.Opacity = 0.5
    var tooltip = createTooltip(viewer._element)
    //绘制多边形
    var handlerPolygon = new Cesium.DrawHandler(
      viewer,
      Cesium.DrawMode.Polygon,
      0
    )
    this.floatFlag = true
    handlerPolygon.activeEvt.addEventListener(function(isActive) {
      if (isActive == true) {
        viewer.enableCursorStyle = false
        viewer._element.style.cursor = ''
        // $('body')
        //   .removeClass('drawCur')
        //   .addClass('drawCur')
      } else {
        viewer.enableCursorStyle = true
        //$('body').removeClass('drawCur')
      }
    })
    handlerPolygon.movingEvt.addEventListener(function(windowPosition) {
      if (windowPosition.x < 200 && windowPosition.y < 150) {
        tooltip.setVisible(false)
        return
      }
    })
    handlerPolygon.drawEvt.addEventListener(function(result) {
      if (!result.object.positions) {
        handlerPolygon.polygon.show = false
        handlerPolygon.polyline.show = false
        handlerPolygon.deactivate()
        handlerPolygon.activate()
        return
      }
      var array = [].concat(result.object.positions)
      tooltip.setVisible(false)
      var positions = []
      for (var i = 0, len = array.length; i < len; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(array[i])
        var longitude = Cesium.Math.toDegrees(cartographic.longitude)
        var latitude = Cesium.Math.toDegrees(cartographic.latitude)
        var h = cartographic.height
        if (
          positions.indexOf(longitude) == -1 &&
          positions.indexOf(latitude) == -1
        ) {
          positions.push(longitude)
          positions.push(latitude)
          positions.push(h)
        }
      }
        console.log(positions)
      slope.CoverageArea = positions
      viewer.scene.globe.SlopeSetting = {
        slopeSetting: slope,
        analysisMode: wide
      }
      handlerPolygon.polygon.show = false
      handlerPolygon.polyline.show = true
      handlerPolygon.deactivate()
      handlerPolygon.activate()
    })
    handlerPolygon.activate()
    viewer._cesiumWidget._creditContainer.style.display = 'none'

    if (!scene.pickPositionSupported) {
      alert(
        '不支持深度纹理,无法绘制多边形，根据多边形显示分析区域功能无法使用！'
      )
    }

    // $('#btnContainer').show();
    // $('#loadingbar').remove();
    this.viewer = viewer
    this.scene = scene
    this.handlerPolygon = handlerPolygon
    this.colorTable = colorTable
    this.slope = slope
    this.wide = wide
  },
  methods: {
    changeRadio() {
      if (this.radio == 3) {
        this.slope.DisplayMode = Cesium.SlopeSettingEnum.DisplayMode.FACE
      } else if (this.radio == 6) {
        this.slope.DisplayMode = Cesium.SlopeSettingEnum.DisplayMode.ARROW
      } else {
        this.slope.DisplayMode =
          Cesium.SlopeSettingEnum.DisplayMode.FACE_AND_ARROW
      }
      this.viewer.scene.globe.SlopeSetting = {
        slopeSetting: this.slope,
        analysisMode: this.wide
      }
    },
    changeWideminR(e) {
      this.wideminR = e.target.value
      this.slope.MinVisibleValue = this.wideminR
      this.viewer.scene.globe.SlopeSetting = {
        slopeSetting: this.slope,
        analysisMode: this.wide
      }
    },
    changeWidemaxR(e) {
      this.widemaxR = e.target.value
      this.slope.MaxVisibleValue = this.widemaxR
      this.viewer.scene.globe.SlopeSetting = {
        slopeSetting: this.slope,
        analysisMode: this.wide
      }
    },
    changeCalMode() {
      var index = parseInt(this.calMode)
      switch (index) {
        case 0:
          this.wide =
            Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_REGION
          break
        case 1:
          this.wide = Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
          break
        case 2:
          this.wide = Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_NONE
          break
        default:
          break
      }
      this.viewer.scene.globe.SlopeSetting = {
        slopeSetting: this.slope,
        analysisMode: this.wide
      }
    },
    handleCommand(command) {
      var colorTable = this.colorTable
      colorTable.remove(0)
      colorTable.remove(20)
      colorTable.remove(30)
      colorTable.remove(50)
      colorTable.remove(80)

      var value = parseInt(command)
      this.band = 'band' + value
      switch (value) {
        case 1:
          colorTable.insert(0, new Cesium.Color(9 / 255, 9 / 255, 255 / 255))
          colorTable.insert(20, new Cesium.Color(0, 161 / 255, 1))
          colorTable.insert(30, new Cesium.Color(20 / 255, 187 / 255, 18 / 255))
          colorTable.insert(50, new Cesium.Color(221 / 255, 224 / 255, 7 / 255))
          colorTable.insert(80, new Cesium.Color(255 / 255, 0 / 255, 0 / 255))
          break
        case 2:
          colorTable.insert(
            0,
            new Cesium.Color(162 / 255, 251 / 255, 194 / 255)
          )
          colorTable.insert(
            20,
            new Cesium.Color(180 / 255, 200 / 255, 170 / 255)
          )
          colorTable.insert(
            30,
            new Cesium.Color(200 / 255, 160 / 255, 130 / 255)
          )
          colorTable.insert(
            50,
            new Cesium.Color(225 / 255, 130 / 255, 130 / 255)
          )
          colorTable.insert(80, new Cesium.Color(1, 103 / 255, 103 / 255))
          break
        case 3:
          colorTable.insert(0, new Cesium.Color(230 / 255, 198 / 255, 1))
          colorTable.insert(20, new Cesium.Color(210 / 255, 150 / 255, 1))
          colorTable.insert(30, new Cesium.Color(190 / 255, 100 / 255, 1))
          colorTable.insert(50, new Cesium.Color(165, 50 / 255, 1))
          colorTable.insert(80, new Cesium.Color(157 / 255, 0, 1))
          break
        case 4:
          colorTable.insert(0, new Cesium.Color(0, 39 / 255, 148 / 255))
          colorTable.insert(20, new Cesium.Color(0, 39 / 255, 148 / 255))
          colorTable.insert(
            30,
            new Cesium.Color(70 / 255, 116 / 255, 200 / 255)
          )
          colorTable.insert(
            50,
            new Cesium.Color(149 / 255, 232 / 255, 249 / 255)
          )
          colorTable.insert(
            80,
            new Cesium.Color(149 / 255, 232 / 255, 249 / 255)
          )
          break
        case 5:
          colorTable.insert(0, new Cesium.Color(186 / 255, 1, 190 / 255))
          colorTable.insert(20, new Cesium.Color(186 / 255, 1, 180 / 255))
          colorTable.insert(
            30,
            new Cesium.Color(106 / 255, 255 / 255, 170 / 255)
          )
          colorTable.insert(
            50,
            new Cesium.Color(26 / 255, 255 / 255, 160 / 255)
          )
          colorTable.insert(
            80,
            new Cesium.Color(26 / 255, 255 / 255, 156 / 255)
          )
          break
        default:
          break
      }
      this.slope.ColorTable = colorTable
      this.viewer.scene.globe.SlopeSetting = {
        slopeSetting: this.slope,
        analysisMode: this.wide
      }
    },
    clearBtn() {
      this.viewer.scene.globe.SlopeSetting = {
        slopeSetting: this.slope,
        analysisMode: Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_NONE
      }
      this.handlerPolygon.polygon.show = false
      this.handlerPolygon.polyline.show = false
    },
    changeTrans(e) {
      this.trans = e.target.value
      this.slope.Opacity = this.trans
      this.viewer.scene.globe.SlopeSetting = {
        slopeSetting: this.slope,
        analysisMode: this.wide
      }
    }
  }
}
</script>

<style>
#split {
  position: fixed;
}
.selectpicker {
  width: 220px;
}
.selectpicker option {
  width: 100%;
}
.bootstrap-select:not([class*='col-']):not([class*='form-control']):not(.input-group-btn) {
  width: 220px;
}
.bootstrap-select.btn-group:not(.input-group-btn),
.bootstrap-select.btn-group[class*='col-'] {
  float: none;
  display: inline-block;
  margin-left: 0px;
}
.btn-group {
  position: relative;
  display: inline-block;
  font-size: 0px;
  white-space: nowrap;
  vertical-align: middle;
}
.band4 {
  background: -webkit-linear-gradient(left, #95e8f9, #002794) !important;
}
.band2 {
  background: -webkit-linear-gradient(left, #a2fbc2, #ff6767) !important;
}
.band3 {
  background: -webkit-linear-gradient(left, #e6c6ff, #9d00ff) !important;
}
.band1 {
  background: -webkit-linear-gradient(
    left,
    #0909d4,
    #00a1ff 20%,
    #14bb12 40%,
    #dde007 60%,
    #d20f0f
  ) !important;
}
.band5 {
  background: -webkit-linear-gradient(left, #baffe5, #1ab99c) !important;
}
.band6 {
  background: -webkit-linear-gradient(
    left,
    #93f602,
    #2fac01,
    #74cb01,
    #d0ef01,
    #e1ce01,
    #e16a01,
    #f70701
  ) !important;
}
.label {
  display: inline;
  padding: 0.01em 3.5em 0.01em 3.5em;
  font-size: 150%;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
  line-height: 1.1;
}
</style>
