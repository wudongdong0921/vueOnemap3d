<template>
  <div>
    <div id="cesiumContainer"></div>
    <div id='loadingbar'
         v-if="loadingbarFlag"
         class="spinner">
      <div class="spinner-container container1">
        <div class="circle1"></div>
        <div class="circle2"></div>
        <div class="circle3"></div>
        <div class="circle4"></div>
      </div>
      <div class="spinner-container container2">
        <div class="circle1"></div>
        <div class="circle2"></div>
        <div class="circle3"></div>
        <div class="circle4"></div>
      </div>
      <div class="spinner-container container3">
        <div class="circle1"></div>
        <div class="circle2"></div>
        <div class="circle3"></div>
        <div class="circle4"></div>
      </div>
    </div>
    <div id="toolbar"
         v-if="toolbarFlag"
         class="param-container tool-bar">
      <div class="param-item">
        <label class="form-label">开挖深度(米) :</label>
        <input id="depth"
               type="number"
               :value="depth"
               required="required"
               style="width:90px;" />
      </div>
      <div class="param-item">
        <el-button @click="clear"
                   type="primary">清除</el-button>
        <!-- <button type="button" id="clear" @click="clear" style="float:right;" class="button black">清除</button> -->
      </div>
    </div>
  </div>
</template>

<script>
import { createTooltip } from '@/assets/js/tooltip.js'

export default {
  data() {
    return {
      height: '0',
      width: '0',
      loadingbarFlag: true,
      toolbarFlag: false,
      scene: '',
      depth: 500,
      handlerPolygon: null,
      handler: null
    }
  },
  mounted() {
    let that = this
    //初始化viewer部件，添加STK World Terrain地形服务
    var viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: URL_CONFIG.STK,
        requestWaterMask: true,
        requestVertexNormals: true,
        isSct: false
      })
    })
    viewer.imageryLayers.addImageryProvider(
      new Cesium.BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        mapStyle: Cesium.BingMapsStyle.AERIAL,
        key: URL_CONFIG.BING_MAP_KEY
      })
    )
    var scene = viewer.scene
    // 设置相机视角
    viewer.scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(88.3648, 29.0946, 90000),
      orientation: {
        heading: 6.10547067016156,
        pitch: -0.8475077031996778,
        roll: 6.2831853016686185
      }
    })
    var tooltip = createTooltip(viewer._element)
    //绘制多边形
    var handlerPolygon = new Cesium.DrawHandler(
      viewer,
      Cesium.DrawMode.Polygon,
      0
    )
    handlerPolygon.activeEvt.addEventListener(function(isActive) {
      if (isActive == true) {
        viewer.enableCursorStyle = false
        viewer._element.style.cursor = ''
        //$('body').removeClass('drawCur').addClass('drawCur');
      } else {
        viewer.enableCursorStyle = true
        //$('body').removeClass('drawCur');
      }
    })
    handlerPolygon.movingEvt.addEventListener(function(windowPosition) {
      if (windowPosition.x < 200 && windowPosition.y < 150) {
        tooltip.setVisible(false)
        return
      }
      if (handlerPolygon.isDrawing) {
        tooltip.showAt(
          windowPosition,
          '<p>点击确定开挖区域中间点</p><p>右键单击结束绘制,进行开挖</p>'
        )
      } else {
        tooltip.showAt(windowPosition, '<p>点击绘制开挖区域第一个点</p>')
      }
    })
    handlerPolygon.drawEvt.addEventListener(function(result) {
      if (!result.object.positions) {
        tooltip.showAt(result, '<p>请绘制正确的多边形</p>')
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
      var dep = that.depth
      viewer.scene.globe.removeAllExcavationRegion()
      viewer.scene.globe.addExcavationRegion({
        name: 'ggg',
        position: positions,
        height: dep,
        transparent: false
      })
      handlerPolygon.polygon.show = false
      handlerPolygon.polyline.show = false
      handlerPolygon.deactivate()
      handlerPolygon.activate()
    })
    handlerPolygon.activate()
    this.handlerPolygon = handlerPolygon
    if (!scene.pickPositionSupported) {
      alert('不支持深度纹理,无法绘制多边形，地形开挖功能无法使用！')
    }
    this.toolbarFlag = true
    this.loadingbarFlag = false

    this.scene = scene
    this.viewer = viewer
  },
  methods: {
    //剖面
    chooseView() {
      //先清除之前绘制的线
      this.handlerLine.clear()
      document.getElementById('pro').width = 0
      document.getElementById('pro').height = 0
      if (this.handlerLine.active) {
        return
      } else {
        this.handlerLine.activate()
        //由于剖面分析只能绘制直线，此处绘制时单击两次就触发结束事件
        this.handler.setInputAction(e => {
          if (this.handlerLine.polyline._actualPositions.length == 2) {
            var result = {}
            result.object = this.handlerLine.polyline
            this.handlerLine.drawEvt.raiseEvent(result)
            this.handlerLine.deactivate()
            this.handler.removeInputAction(
              Cesium.ScreenSpaceEventType.LEFT_CLICK
            )
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }
    },
    clear() {
      this.viewer.scene.globe.removeAllExcavationRegion()
      this.handlerPolygon.polygon.show = false
      this.handlerPolygon.polyline.show = false
    }
  }
}
</script>

<style>
/* .drawCur{
            cursor: url('./../../assets/images/cur/draw.cur'), auto;
        } */
</style>
