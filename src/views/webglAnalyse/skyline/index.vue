<!--天际线-->
<template>
  <div>
    <div id="cesiumContainer"></div>
    <div id='loadingbar'
         v-if="loadingbar"
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
                   type="primary">提取天际线</el-button>
        <el-button @click="getSkyline2D"
                   type="primary">二维天际线</el-button>
         <el-button @click="setLimitBody"
                   type="primary">绘制限高体</el-button>
        <el-button @click="getSkylineArea"
                   type="primary">拉伸闭合体</el-button>          
        <el-button @click="clearBtn">清除</el-button>

      <!-- <button type="button"
              id="chooseView"
              @click="chooseView"
              class="button black">提取天际线</button>
      <button type="button"
              id="getSkyline2D"
              @click="getSkyline2D"
              class="button black">二维天际线</button>
      <button type="button"
              id="setLimitBody"
              @click="setLimitBody"
              class="button black">绘制限高体</button>
      <button type="button"
              id="getSkylineArea"
              @click="getSkylineArea"
              class="button black">拉伸闭合体</button>
      <button type="button"
              id="clear"
              @click="clear"
              class="button black">清除</button> -->
    </div>

    <div id="map"
    v-show="mapFlag"
         style="position : absolute;right : 5%; bottom : 5%;width:450px;height:400px;"></div>
  </div>
</template>

<script>
import { createTooltip } from '@/assets/js/tooltip.js'
import echarts from '@/utils/echartsSet'
export default {
  data() {
    return {
      chooseViewFlag: false,
      getSkyline2DFlag: false,
      setLimitBodyFlag: false,
      getSkylineAreaFlag: false,
      mapFlag: false,
      toolbarFlag: false,
      loadingbar: true,
      skyline: null,
      scene: null,
      polygonHandler: null,
      viewer: null
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
      alert('不支持深度纹理,天际线分析功能无法使用！')
    }
    this.toolbarFlag = true
    this.loadingbar = false
    var skyline = new Cesium.Skyline(scene) //创建天际线分析对象
    this.skyline = skyline
    var polygonHandler = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Polygon)
    this.polygonHandler = polygonHandler
    var widget = viewer.cesiumWidget
    try {
      var promise = scene.open(URL_CONFIG.SCENE_CBD)
      Cesium.when(
        promise,
        function(layers) {
          scene.camera.setView({
            //图层加载完成,设置相机位置
            destination: Cesium.Cartesian3.fromDegrees(
              116.4465,
              39.9066,
              47.9552
            ),
            orientation: {
              heading: 0.34395448573153864,
              pitch: -0.0538346996932666,
              roll: 6.2831853071795685
            }
          })
          for (var i = 0; i < layers.length; i++) {
            layers[i].selectEnabled = false
          }
        },
        function(e) {
          if (widget._showRenderLoopErrors) {
            var title = '加载SCP失败，请检查网络连接状态或者url地址是否正确？'
            widget.showErrorPanel(title, undefined, e)
          }
        }
      )
    } catch (e) {
      if (widget._showRenderLoopErrors) {
        var title = '渲染时发生错误，已停止渲染。'
        widget.showErrorPanel(title, undefined, e)
      }
    }
    try {
      
      // 绘制多边形结束的回调事件
      polygonHandler.drawEvt.addEventListener(function(result) {
        // 清除之前的限高体对象
        skyline.removeLimitbody('limitBody')
        var polygon = result.object
        polygon.show = false
        var pos = polygon.positions
        var positions = []
        // 遍历多边形，取出所有点
        for (var i = 0, len = pos.length; i < len; i++) {
          //转化为经纬度，并加入至临时数组
          var cartographic = Cesium.Cartographic.fromCartesian(pos[i])
          var longitude = Cesium.Math.toDegrees(cartographic.longitude)
          var latitude = Cesium.Math.toDegrees(cartographic.latitude)

          positions.push([longitude, latitude])
        }
        //去除重复点
        positions = unique(positions)
        var arr = []
        //再次遍历转化为接口所需的数组格式
        for (var i = 0, len = positions.length; i < len; i++) {
          arr.push(positions[i][0])
          arr.push(positions[i][1])
        }

        //添加限高体对象
        skyline.addLimitbody({
          position: arr,
          name: 'limitBody'
        })
      })
      //去重函数
      unique = function(arr) {
        var res = []
        var json = {}
        for (var i = 0; i < arr.length; i++) {
          if (!json[arr[i]]) {
            res.push(arr[i])
            json[arr[i]] = 1
          }
        }
        return res
      }
     
    } catch (e) {
      if (scene.context.depthTexture) {
          alert('天际线分析", "该浏览器不支持深度纹理检测！')
        //swal("天际线分析", "该浏览器不支持深度纹理检测", "warning");
      }
    }
    this.scene = scene
    this.viewer = viewer
    if (!this.scene.pickPositionSupported) {
      alert('不支持深度拾取,淹没分析功能无法使用（无法交互绘制面）！')
    }
  },
  methods: {
    //提取天际线
    chooseView() {
      var cartographic = this.scene.camera.positionCartographic
      var longitude = Cesium.Math.toDegrees(cartographic.longitude)
      var latitude = Cesium.Math.toDegrees(cartographic.latitude)
      var height = cartographic.height

      //天际线分析的视口位置设置成当前相机位置
      var skyline = this.skyline
      skyline.viewPosition = [longitude, latitude, height]
      //设置俯仰和方向
      skyline.pitch = Cesium.Math.toDegrees(this.scene.camera.pitch)
      skyline.direction = Cesium.Math.toDegrees(this.scene.camera.heading)
      skyline.radius = 10000 // 天际线分析半径设置为10000米
      skyline.build()
      this.getSkyline2DFlag = true
      this.setLimitBodyFlag = true
      this.mapFlag = false
    },
    //二维天际线
    getSkyline2D() {
      //获取二维天际线对象
      var object = this.skyline.getSkyline2D()
      //用echarts绘制二维天际线
      var myChart = echarts.init(document.getElementById('map'))
      var option = {
        backgroundColor: 'rgba(73,139,156,0.9)',
        title: {
          text: '二维天际线'
        },

        tooltip: {
          trigger: 'axis'
        },

        calculable: true,
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: object.x,
            show: false
          }
        ],

        yAxis: [
          {
            type: 'value',
            min: 0,
            max: 1
          }
        ],

        series: [
          {
            name: '',
            type: 'line',
            data: object.y
          }
        ]
      }
      myChart.setOption(option)
      this.mapFlag = true
    },
    //绘制限高体
    setLimitBody() {
      if (this.polygonHandler.active) {
        return
      }
      this.polygonHandler.activate()
    },
    //拉伸闭合体
    getSkylineArea() {
      var cartographic = this.scene.camera.positionCartographic
      var longitude = Cesium.Math.toDegrees(cartographic.longitude)
      var latitude = Cesium.Math.toDegrees(cartographic.latitude)
      var height = cartographic.height
      var points = this.skyline.getSkyline3D()
      var pointArr = new Array()
      var cameraPoint = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      )
      pointArr.push(cameraPoint)
      for (var i = 0; i < points.x.length; i++) {
        var point = Cesium.Cartesian3.fromDegrees(
          points.x[i],
          points.y[i],
          points.z[i]
        )
        pointArr.push(point)
      }
      this.viewer.entities.add({
        polygon: {
          extrudedHeight: 30,
          hierarchy: pointArr,
          perPositionHeight: true,
          material: Cesium.Color.ORANGE.withAlpha(1.0)
        }
      })
    },

    clearBtn() {
      this.viewer.entities.removeAll()
      this.skyline.clear()
      this.polygonHandler.clear()
      this.mapFlag = false
    }
  }
}
</script>

<style>
/* .drawCur{
            cursor: url('./../../assets/images/cur/draw.cur'), auto;
        } */
#shadowRadioBox {
  position: fixed;
  right: 8px;
  bottom: 8px;
  background-color: #ffffe0;
}
#shadowRadioBox caption {
  background-color: #ffffe0;
}
#shadowRadioBox td {
  padding-left: 8px;
  padding-right: 8px;
  height: 20px;
}
#shadowRadioBox tr {
  height: 20px;
}
</style>
