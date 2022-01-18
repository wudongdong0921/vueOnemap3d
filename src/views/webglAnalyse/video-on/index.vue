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
    v-show="toolbarFlag"
         class="param-container tool-bar">
         <div class="wdd-bottom">
             <el-button @click="handleActive"
                   type="primary">视频投放</el-button>
        <el-button @click="handleCilpRegion"
                   type="primary">绘制裁剪面</el-button>
        <el-button @click="clearBtn">清除</el-button>
         </div>
         
      <!-- <button type="button"
              id="active"
              @click="handleActive"
              class="button black">视频投放</button>
      <button type="button"
              id="cilpRegion"
              @click="handleCilpRegion"
              class="button black">绘制裁剪面</button>
      <button type="button"
              id="clear"
              @click="clear"
              class="button black">清除</button> -->
      <video id="trailer"
             style="display:none"
             autoplay
             loop
             crossorigin
             controls>
        <source src="@/assets/media/video.mp4"
                type="video/mp4">
      </video>
      <div class="param-item wdd-bottom">
        <b>宽度：</b>
        <input @change="changeHorizontal($event)"
               type="range"
               id="horizontal"
               min="1"
               max="50"
               step="1"
               :value="horizontal">
      </div>
      <div class="param-item wdd-bottom">
        <b>高度：</b>
        <input @change="changeVertical($event)"
               type="range"
               id="vertical"
               min="1"
               max="50"
               step="1"
               :value="vertical">
      </div>
      <div class="param-item wdd-bottom">
        <b>距离：</b>
        <input @change="changeRange($event)"
               type="range"
               id="distance"
               min="100"
               max="1000"
               step="1"
               :value="distance">
      </div>
      <div class="param-item wdd-bottom">
        <b>裁剪模式：</b>
        <select id="clip-mode"
                @change="changeMode($event)"
                v-model="mode"
                class="cesium-button">
          <option v-for="(item,index) in modeList" :key="index" :value="item.value">{{item.label}}</option>
        </select>
      </div>
      <div>
        <label>
          <input @change="changeVisibleLine"
                 type="checkbox"
                 v-model="visibleLine"
                 id="visibleLine"
                 style="display:inline-block; vertical-align: middle;"
                 checked>
          <span style="display:inline-block; vertical-align: middle;margin-left:10px">显示视频投放线</span>
        </label>

      </div>
    </div>
  </div>
</template>

<script>
import { createTooltip } from '@/assets/js/tooltip.js'
const modeList = [
    {
        label: "保留区域内",
        value: "clip-insid"
    },
    {
        label: "保留区域外",
        value: "clip-outside"
    }
]
export default {
  data() {
    return {
        modeList: modeList,
      horizontal: 10,
      vertical: 10,
      distance: 200,
      mode: 'clip-insid',
      visibleLine: false,
      loadingbarFlag: true,
      toolbarFlag: false,
      scene: '',
      handlerPolygon: null,
      handler: null,
      projectionImage: null,
      videoElement: ''
    }
  },
  mounted() {
    let that = this
    var viewer = new Cesium.Viewer('cesiumContainer')
    viewer.imageryLayers.addImageryProvider(
      new Cesium.BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        mapStyle: Cesium.BingMapsStyle.AERIAL,
        key: URL_CONFIG.BING_MAP_KEY
      })
    )

    var scene = viewer.scene
    scene.shadowMap.darkness = 1.275 //设置第二重烘焙纹理的效果（明暗程度）
    scene.skyAtmosphere.brightnessShift = 0.4 //修改大气的亮度
    scene.debugShowFramesPerSecond = true
    scene.hdrEnabled = false
    scene.sun.show = false
    // 01设置环境光的强度-新处理CBD场景
    scene.lightSource.ambientLightColor = new Cesium.Color(0.65, 0.65, 0.65, 1)
    // 添加光源
    var position1 = new Cesium.Cartesian3.fromDegrees(
      116.261209157595,
      39.3042238956531,
      480
    )
    //光源方向点

    var targetPosition1 = new Cesium.Cartesian3.fromDegrees(
      116.261209157595,
      39.3042238956531,
      430
    )
    var dirLightOptions = {
      targetPosition: targetPosition1,
      color: new Cesium.Color(1.0, 1.0, 1.0, 1),
      intensity: 0.55
    }
    var directionalLight_1 = new Cesium.DirectionalLight(
      position1,
      dirLightOptions
    )
    scene.addLightSource(directionalLight_1)

    if (!scene.pickPositionSupported) {
      alert('不支持深度纹理,视频投放功能无法使用！')
    }

    this.loadingbarFlag = false
    this.toolbarFlag = true

    var groundPromise = scene.addS3MTilesLayerByScp(
      URL_CONFIG.SCP_CBD_GROUND1,
      {
        name: 'ground1'
      }
    )
    var buildPromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_BUILD, {
      name: 'build'
    })
    var lakePromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_LAKE, {
      name: 'lake'
    })
    var treePromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_TREE, {
      name: 'tree'
    })
    var roadPromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_ROAD, {
      name: 'road'
    })
    var bridgePromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_BRIDGE, {
      name: 'bridge'
    })
    Cesium.when.all(
      [
        groundPromise,
        buildPromise,
        lakePromise,
        treePromise,
        roadPromise,
        bridgePromise
      ],
      function(layers) {
        //图层加载完成,设置相机位置
        scene.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(
            116.4486,
            39.9092,
            91.3293
          ),
          orientation: {
            heading: 3.179304500963121,
            pitch: -0.46239072362282485,
            roll: 6.283185307179583
          }
        })
        for (var i = 0; i < layers.length; i++) {
          layers[i].selectEnabled = false
        }
        var videoElement = document.getElementById('trailer')
        that.videoElement = videoElement
        var projectionImage = new Cesium.ProjectionImage(scene)

        var handler = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Point)
        handler.movingEvt.addEventListener(function(windowPosition) {
          var last = scene.pickPosition(windowPosition)
          //计算该点与视口位置点坐标的距离
          var distance = Cesium.Cartesian3.distance(scene.camera.position, last)
          if (distance > 0) {
            //将鼠标当前点坐标转化成经纬度
            var cartographic = Cesium.Cartographic.fromCartesian(last)
            var longitude = Cesium.Math.toDegrees(cartographic.longitude)
            var latitude = Cesium.Math.toDegrees(cartographic.latitude)
            var height = cartographic.height
            //通过该点设置视频投放对象的距离及方向
            projectionImage.setDistDirByPoint([longitude, latitude, height])
            projectionImage.distance = Number(that.distance)
          }
        })
        that.handler = handler
        //绘制裁剪面
        var handlerPolygon = new Cesium.DrawHandler(
          viewer,
          Cesium.DrawMode.Polygon,
          0
        )
          that.projectionImage = projectionImage
          that.handlerPolygon = handlerPolygon
        handlerPolygon.drawEvt.addEventListener(function(result) {
          var array = [].concat(result.object.positions)
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
          handlerPolygon.polygon.show = false
          handlerPolygon.polyline.show = false
          projectionImage.addClipRegion({ name: 'test', position: positions })
          handlerPolygon.deactivate()
          that.handlerPolygon = handlerPolygon
          
        })
      },
      function(e) {
        if (widget._showRenderLoopErrors) {
          var title = '加载SCP失败，请检查网络连接状态或者url地址是否正确？'
          widget.showErrorPanel(title, undefined, e)
        }
      }
    )

    this.scene = scene
    this.viewer = viewer
  },
  methods: {
    handleActive() {
      this.clearAndActive()
      this.handler.activate()
    },
    handleCilpRegion() {
      this.handlerPolygon.deactivate()
      this.handlerPolygon.activate()
    },
    clearAndActive() {
      this.projectionImage.distance = 0.1
      var wgsPosition = this.scene.camera.positionCartographic
      var longitude = Cesium.Math.toDegrees(wgsPosition.longitude)
      var latitude = Cesium.Math.toDegrees(wgsPosition.latitude)
      var height = wgsPosition.height
      this.projectionImage.viewPosition = [longitude, latitude, height]
      this.projectionImage.horizontalFov = Number(this.horizontal)
      this.projectionImage.verticalFov = Number(this.vertical)
      this.projectionImage.setImage({
        video: this.videoElement
      })
      this.projectionImage.removeAllClipRegion()
      this.projectionImage.build()
    },
    clearBtn() {
      this.clearAndActive()
      this.handler.clear()
      this.handlerPolygon.clear()
    },
    changeHorizontal(e) {
      //var value = Number(this.horizontal)
      var value = e.target.value
      this.horizontal = value
      this.projectionImage.horizontalFov = value
    },
    changeVertical(e) {
      //var value = Number(this.vertical)
      var value = e.target.value
      this.vertical = value
      this.projectionImage.verticalFov = value
    },
    changeRange(e) {
      //var value = Number(this.distance)
      
      var value = e.target.value
      this.distance = value
      this.projectionImage.distance = value
    },
    changeMode(e) {
      var clipMode =
        this.mode === 'clip-inside'
          ? Cesium.ModifyRegionMode.CLIP_INSIDE
          : Cesium.ModifyRegionMode.CLIP_OUTSIDE
      this.projectionImage.setClipMode(clipMode)
    },
    changeVisibleLine() {
      this.projectionImage.hintLineVisible = this.visibleLine
    }
  }
}
</script>

<style>
/* .drawCur{
            cursor: url('./../../assets/images/cur/draw.cur'), auto;
        } */
</style>
