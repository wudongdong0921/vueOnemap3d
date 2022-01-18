<!--光照-->
<template>
  <div>
    <div id="cesiumContainer"></div>
    <div id='loadingbar'
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
    <div id='toolbar'
         class="param-container tool-bar">
      <div class="param-item wdd-bottom">
        <b>日期选择：</b>
        <el-date-picker v-model="timer"
                        type="date"
                        placeholder="选择日期">
        </el-date-picker>
      </div>
      <div class="param-item wdd-bottom">
        <b>开始时间：</b>
        <select id="startTime"
                v-model="startTime"
                @change="changeStartTime"
                class="form-control">
          <option v-for="(item, index) in startList"
                  :key="index"
                  :value="item.value">{{item.label}}</option>
        </select>

      </div>
      <div class="param-item wdd-bottom">
        <b>结束时间：</b>
        <select id="endTime"
                v-model="overTime"
                @change="changeOverTime"
                class="form-control">
          <option v-for="(item, index) in overList"
                  :key="index"
                  :value="item.value">{{item.label}}</option>
        </select>
      </div>
      <div class="param-item wdd-bottom">
        <b>底部高程：</b>
        <input id="bottomHeight"
               class="wdd-input"
               :value="elevation" />
      </div>
      <div class="param-item wdd-bottom">
        <b>拉伸高度：</b>
        <input id="extrudeHeight"
               class="wdd-input"
               :value="height" />
      </div>
      <div class="param-item wdd-bottom">
        <el-button @click="shadowAnalysis"
                   type="primary">阴影分析</el-button>
        <el-button @click="sunlight"
                   type="primary">日照效果</el-button>
        <el-button @click="shadowRadio"
                   type="primary">获取阴影率</el-button>
        <el-button @click="clearBtn">清除</el-button>
        <!-- <button type="button"
                id="shadowAnalysis"
                @click="shadowAnalysis"
                class="button black">阴影分析</button>
        <button type="button"
                id="sunlight"
                @click="sunlight"
                class="button black">日照效果</button>
        <button type="button"
                id="clear"
                @click="clear"
                class="button black">清除</button>
        <button type="button"
                id="shadowRadio"
                @click="shadowRadio"
                class="button black">获取阴影率</button> -->
      </div>
      <div id="shadowRadioBox"
           v-show="shadowRadioBoxFlag">
        <h5 style="padding:4px;color:#333">阴影率窗口</h5>
        <table style="color:#000">
          <!-- <caption id="title"><b>阴影率窗口</b></caption> -->
          <tr>
            <td><b>阴影率：</b></td>
            <td><input type="text"
                     id="shadowRadioText"
                     :value="shadowRadioText"
                     class="displayText"
                     readonly /></td>
          </tr>
          <tr>
            <td><b>经度：</b></td>
            <td><input type="text"
                     id="longitudeText"
                     :value="longitudeText"
                     readonly
                     class="displayText"></td>
          </tr>
          <tr>
            <td><b>纬度：</b></td>
            <td><input type="text"
                     id="latitudeText"
                     :value="latitudeText"
                     readonly
                     class="displayText"></td>
          </tr>
          <tr>
            <td><b>高程：</b></td>
            <td><input type="text"
                     id="heightText"
                     :value="heightText"
                     readonly
                     class="displayText"></td>
          </tr>

        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { createTooltip } from '@/assets/js/tooltip.js'
const startList = [
  {
    label: '00:00',
    value: '0'
  },
  {
    label: '2:00',
    value: '2'
  },
  {
    label: '4:00',
    value: '4'
  },
  {
    label: '6:00',
    value: '6'
  },
  {
    label: '8:00',
    value: '8'
  },
  {
    label: '10:00',
    value: '10'
  },
  {
    label: '12:00',
    value: '12'
  },
  {
    label: '14:00',
    value: '14'
  },
  {
    label: '16:00',
    value: '16'
  },
  {
    label: '18:00',
    value: '18'
  },
  {
    label: '20:00',
    value: '20'
  },
  {
    label: '22:00',
    value: '22'
  }
]
const overList = [
  {
    label: '2:00',
    value: '2'
  },
  {
    label: '4:00',
    value: '4'
  },
  {
    label: '6:00',
    value: '6'
  },
  {
    label: '8:00',
    value: '8'
  },
  {
    label: '10:00',
    value: '10'
  },
  {
    label: '12:00',
    value: '12'
  },
  {
    label: '14:00',
    value: '14'
  },
  {
    label: '16:00',
    value: '16'
  },
  {
    label: '18:00',
    value: '18'
  },
  {
    label: '20:00',
    value: '20'
  },
  {
    label: '22:00',
    value: '22'
  },
  {
    label: '24:00',
    value: '24'
  }
]

export default {
  data() {
    return {
      startList: startList,
      overList: overList,
      timer: '2020-10-20',
      startTime: '10',
      overTime: '12',
      height: 20,
      elevation: 20,
      scene: '',
      handlerPolygon: null,
      shadowQuery: null,
      viewer: null,
      points: '',
      shadowRadioText: '', //阴影率
      longitudeText: '', //经度
      latitudeText: '', //维度
      heightText: '', //高程
      shadowRadioBoxFlag: false
    }
  },
  mounted() {
    let that = this
    //创建viewer时开启阴影，确保阴影分析可用
    var viewer = new Cesium.Viewer('cesiumContainer', {
      shadows: true
    })
    viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
            url : 'https://dev.virtualearth.net',
            mapStyle : Cesium.BingMapsStyle.AERIAL,
            key : URL_CONFIG.BING_MAP_KEY
        }));
    var scene = viewer.scene
    this.gorupFlag = true
    var widget = viewer.cesiumWidget
    try {
      //添加S3M图层服务
      var promise = scene.open('http://192.168.1.189:8090/iserver/services/3D-BaiShanShiJiangYuanQu/rest/realspace');
      Cesium.when(
        promise,
        function(layers) {
            console.log(layers)
          // 设置相机视角，便于查看模型
          scene.camera.setView({
              //相机在WGS84世界坐标系中的最终位置，或是自顶向下视图中可见的矩形区域
            destination: new Cesium.Cartesian3.fromDegrees(
              126.606585911968,
              42.0081187082649,
              700
            ),
            orientation: {
              up: new Cesium.Cartesian3(
                -0.1629169048778112,
                0.7143202157541026,
                0.6805914424014209
              ),
              direction: new Cesium.Cartesian3(
                0.5945902470233576,
                -0.4793925407032518,
                0.6454806194323606
              ),
              heading: 5.899584294129949
            }
          });
        },
        function(e) {
          if (widget._showRenderLoopErrors) {
            var title = "渲染时发生错误，已停止渲染。";
            widget.showErrorPanel(title, undefined, e);
          }
        }
      );
    } catch (e) {
      if (widget._showRenderLoopErrors) {
        var title = "渲染时发生错误，已停止渲染。";
        widget.showErrorPanel(title, undefined, e);
      }
    }
    
 // var scene = viewer.scene
          scene.shadowMap.darkness = 0.3 //设置第二重烘焙纹理的效果（明暗程度）
          scene.skyAtmosphere.brightnessShift = 0.4 //修改大气的亮度
          scene.debugShowFramesPerSecond = true
          scene.hdrEnabled = false
          scene.sun.show = true
          // 01设置环境光的强度-新处理CBD场景
          scene.lightSource.ambientLightColor = new Cesium.Color(
            0.65,
            0.65,
            0.65,
            1
          )
          // 添加光源
          var position1 = new Cesium.Cartesian3.fromDegrees(
            126.606585911968,
            42.0081187082649,
            780
          )
          //光源方向点

          var targetPosition1 = new Cesium.Cartesian3.fromDegrees(
            126.606585911968,
            42.0081187082649,
            830
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


          var layers = scene.layers.find('Config')
          console.log(layers)
          debugger
          //创建阴影查询对象
          var shadowQuery = new Cesium.ShadowQueryPoints(scene)
          layers.selectEnabled = false
          //设置图层的阴影模式
          layers.shadowType = 2
          that.scene = scene
          that.viewer = viewer
          shadowQuery.build()

          that.setCurrentTime()
          var tooltip = createTooltip(document.body)
          var handlerPolygon = new Cesium.DrawHandler(
            viewer,
            Cesium.DrawMode.Polygon,
            0
          )
          handlerPolygon.activeEvt.addEventListener(function(isActive) {
            if (isActive == true) {
              viewer.enableCursorStyle = false
              viewer._element.style.cursor = ''

              //document.getElementsByTagName('body')[0].removeClass('drawCur').addClass('drawCur');
            } else {
              viewer.enableCursorStyle = true
              //document.getElementsByTagName('body')[0].removeClass('drawCur');
            }
          })
          handlerPolygon.movingEvt.addEventListener(function(windowPosition) {
            if (handlerPolygon.isDrawing) {
              tooltip.showAt(
                windowPosition,
                '<p>绘制阴影分析区域(右键结束绘制)</p>'
              )
            }
          })
          console.log(handlerPolygon)
          var points = []
          that.handlerPolygon = handlerPolygon
          handlerPolygon.drawEvt.addEventListener(function(result) {
            tooltip.setVisible(false)
            points.length = 0
            var polygon = result.object
            if (!polygon) {
              return
            }
            polygon.show = false
            handlerPolygon.polyline.show = false
            var positions = [].concat(polygon.positions)
            positions = Cesium.arrayRemoveDuplicates(
              positions,
              Cesium.Cartesian3.equalsEpsilon
            )

            //遍历多边形，取出所有点
            for (var i = 0, len = positions.length; i < len; i++) {
              //转化为经纬度，并加入至临时数组
              var cartographic = Cesium.Cartographic.fromCartesian(
                polygon.positions[i]
              )
              var longitude = Cesium.Math.toDegrees(cartographic.longitude)
              var latitude = Cesium.Math.toDegrees(cartographic.latitude)
              points.push(longitude)
              points.push(latitude)
            }
            //设置分析对象的开始结束时间
            var startTime = new Date(that.timer)
            startTime.setHours(Number(that.startTime))
            shadowQuery.startTime = Cesium.JulianDate.fromDate(startTime)

            var endTime = new Date(that.timer)
            endTime.setHours(Number(that.overTime))
            shadowQuery.endTime = Cesium.JulianDate.fromDate(endTime)

            //设置当前时间
            that.setCurrentTime()

            shadowQuery.spacing = 10
            shadowQuery.timeInterval = 60

            //设置分析区域、底部高程和拉伸高度
            shadowQuery.qureyRegion({
              position: that.points,
              bottom: that.height,
              extend: that.elevation
            })
            that.shadowQuery = shadowQuery
            that.points = points
          })
  },
  methods: {
    //阴影分析
    shadowAnalysis() {
      console.log(this.handlerPolygon)
      this.handlerPolygon.deactivate()
      this.handlerPolygon.activate()
    },
    sunlight() {
      var dateVal = this.timer
      var startTime = new Date(dateVal)
      var endTime = new Date(dateVal)
      var shour = Number(this.startTime)
      var ehour = Number(this.overTime)

      if (shour > ehour) {
        return
      }

      this.shadowQuery.qureyRegion({
        position: [0, 0],
        bottom: 0,
        extend: 0
      })

      var nTimer = 0.0
      var nIntervId = setInterval(() => {
        if (shour < ehour) {
          startTime.setHours(shour)
          startTime.setMinutes(nTimer)
          this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(startTime)
          nTimer += 10.0
          if (nTimer > 60.0) {
            shour += 1.0
            nTimer = 0.0
          }
        } else {
          clearInterval(nIntervId)
          this.shadowQuery.qureyRegion({
            position: this.points,
            bottom: Number(this.height),
            extend: Number(this.elevation)
          })
        }
      }, 20)
    },
    shadowRadio() {
      this.shadowRadioBoxFlag = true
      var handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas)
      handler.setInputAction(e => {
        var position1 = this.scene.pickPosition(e.position)
        var cartographic = Cesium.Cartographic.fromCartesian(position1)
        var shadowRadio = this.shadowQuery.getShadowRadio(cartographic)
        var longitude = Cesium.Math.toDegrees(cartographic.longitude)
        var latitude = Cesium.Math.toDegrees(cartographic.latitude)
        var height = cartographic.height
        this.viewer.entities.removeAll()
        if (shadowRadio != -1) {
          this.shadowRadioText = shadowRadio
          this.longitudeText = longitude
          this.latitudeText = latitude
          this.heightText = height
          this.viewer.entities.add(
            new Cesium.Entity({
              point: new Cesium.PointGraphics({
                color: new Cesium.Color(1, 0, 0, 0.5),
                pixelSize: 15
              }),
              position: Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude,
                height + 0.5
              )
            })
          )
        } else {
          this.shadowRadioText = ''
          this.longitudeText = ''
          this.latitudeText = ''
          this.heightText = ''
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    clearBtn() {
      var handlerPolygon = this.handlerPolygon
      handlerPolygon.deactivate()
      handlerPolygon.polygon.show = false
      handlerPolygon.polyline.show = false
      this.shadowRadioBoxFlag = false
      this.viewer.entities.removeAll()
      this.shadowQuery.qureyRegion({
        position: [0, 0],
        bottom: 0,
        extend: 0
      })
    },
    setCurrentTime() {
      console.log(this.viewer)
      var viewer = this.viewer
      var endTime = new Date(this.timer)
      endTime.setHours(Number(this.overTime))
      this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(endTime)
      this.viewer.clock.multiplier = 1
      this.viewer.clock.shouldAnimate = true
    },
    changeStartTime(val) {
      this.viewer.entities.removeAll()
      var startTime = new Date(this.timer)
      startTime.setHours(Number(this.startTime))
      this.shadowQuery.startTime = Cesium.JulianDate.fromDate(startTime)
    },
    changeOverTime() {
      this.viewer.entities.removeAll()
      var endTime = this.overTime
      this.shadowQuery.endTime = Cesium.JulianDate.fromDate(endTime)
      this.setCurrentTime()
    }

    // $('#bottomHeight').change(function(){
    //     var bh = Number($(this).val());
    //     var eh = Number($('#extrudeHeight').val());
    //     shadowQuery.qureyRegion({
    //         position : points,
    //         bottom : bh,
    //         extend : eh
    //     });
    // });

    // $('#extrudeHeight').change(function(){
    //     var bh = Number($('#bottomHeight').val());
    //     var eh = Number($(this).val());
    //     shadowQuery.qureyRegion({
    //         position : points,
    //         bottom : bh,
    //         extend : eh
    //     });
    // });
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
#toolbar .el-input {
  width: 100%;
}
</style>
