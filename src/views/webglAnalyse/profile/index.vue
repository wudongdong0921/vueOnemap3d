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
      <el-button @click="chooseView"
                 type="primary">剖面分析</el-button>
      <el-button @click="clearBtn">清除</el-button>
      <!-- <button type="button" id="chooseView" @click="chooseView" class="button black">剖面分析</button>
			<button type="button" id="clear" @click="clear" class="button black">清除</button> -->
    </div>
    <canvas style="position : absolute; right : 2%; bottom : 2%;background-color:rgba(65, 65, 65, 0.5)"
            id="pro"
            height="0"
            width="0"></canvas>
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
      toolbarFlag: true,
      scene: '',
      handlerLine: null,
      handler: null
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
    that.toolbarFlag = true
    that.loadingbarFlag = false
    if (!scene.pickPositionSupported) {
      alert('不支持深度纹理,剖面分析功能无法使用！')
    }
    //创建剖面分析对象
    var profile = new Cesium.Profile(scene)
    var tooltip = createTooltip(document.body)
    var widget = viewer.cesiumWidget
    try {
      //添加S3M图层
      var ground1Promise = scene.addS3MTilesLayerByScp(
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
      var bridgePromise = scene.addS3MTilesLayerByScp(
        URL_CONFIG.SCP_CBD_BRIDGE,
        {
          name: 'bridge'
        }
      )
      var promiseSet = [
        ground1Promise,
        buildPromise,
        lakePromise,
        treePromise,
        roadPromise,
        bridgePromise
      ]
      Cesium.when.all(
        promiseSet,
        function(layer) {
          scene.camera.setView({
            //图层加载完成,设置相机位置
            destination: Cesium.Cartesian3.fromDegrees(116.4473, 39.9011, 127),
            orientation: {
              heading: 0.2732,
              pitch: -0.1583,
              roll: 0
            }
          })
          for (var i = 0; i < layer.length; i++) {
            layer[i].selectEnabled = false
          }
        },
        function(e) {
          if (widget._showRenderLoopErrors) {
            var title = '加载SCP失败，请检查网络连接状态或者url地址是否正确？'
            widget.showErrorPanel(title, undefined, e)
          }
        }
      )
      var handlerLine = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Line)
      handlerLine.activeEvt.addEventListener(function(isActive) {
        if (isActive == true) {
          viewer.enableCursorStyle = false
          viewer._element.style.cursor = ''
          //   $('body')
          //     .removeClass('drawCur')
          //     .addClass('drawCur')
        } else {
          viewer.enableCursorStyle = true
          //$('body').removeClass('drawCur')
        }
      })
      handlerLine.movingEvt.addEventListener(function(windowPosition) {
        if (handlerLine.isDrawing) {
          tooltip.showAt(windowPosition, '<p>右键单击结束绘制</p>')
        } else {
          tooltip.showAt(windowPosition, '<p>点击绘制第一个点</p>')
        }
      })
      var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
      this.handler = handler
      handlerLine.drawEvt.addEventListener(function(result) {
        tooltip.setVisible(false)
        var line = result.object
        var startPoint = line._positions[0]
        var endPoint = line._positions[line._positions.length - 1]
        var scartographic = Cesium.Cartographic.fromCartesian(startPoint)
        var slongitude = Cesium.Math.toDegrees(scartographic.longitude)
        var slatitude = Cesium.Math.toDegrees(scartographic.latitude)
        var sheight = scartographic.height
        var ecartographic = Cesium.Cartographic.fromCartesian(endPoint)
        var elongitude = Cesium.Math.toDegrees(ecartographic.longitude)
        var elatitude = Cesium.Math.toDegrees(ecartographic.latitude)
        var eheight = ecartographic.height

        //设置坡面分析的开始和结束位置
        profile.startPoint = [slongitude, slatitude, sheight]
        profile.endPoint = [elongitude, elatitude, eheight]

        profile.extendHeight = 40

        //分析完毕的回调函数
        profile.getBuffer(function(buffer) {
          var canvas = document.getElementById('pro')
          canvas.height = profile._textureHeight
          canvas.width = profile._textureWidth
          var ctx = canvas.getContext('2d')
          var imgData = ctx.createImageData(
            profile._textureWidth,
            profile._textureHeight
          )
          imgData.data.set(buffer)
          //在canvas上绘制图片
          ctx.putImageData(imgData, 0, 0)
          document.getElementById('pro').width = 600
          document.getElementById('pro').height = 450
        })

        profile.build()
      })
      that.handlerLine = handlerLine
    } catch (e) {
      if (scene.context.depthTexture) {
        swal('剖面分析', '该浏览器不支持深度纹理检测', 'warning')
      }
    }

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
            console.log(result)
            this.handlerLine.drawEvt.raiseEvent(result)
            this.handlerLine.deactivate()
            this.handler.removeInputAction(
              Cesium.ScreenSpaceEventType.LEFT_CLICK
            )
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }
    },
    clearBtn() {
      this.handlerLine.clear()
      document.getElementById('pro').width = 0
      document.getElementById('pro').height = 0
    }
  }
}
</script>

<style>
/* .drawCur{
            cursor: url('./../../assets/images/cur/draw.cur'), auto;
        } */
</style>
