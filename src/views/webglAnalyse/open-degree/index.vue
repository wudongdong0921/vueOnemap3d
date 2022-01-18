<!---开敞度-->
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
    <button id="bn"
            v-show="btnFlag"
            @click="handleBtnFlag"
            style="position : absolute; left : 1%; top : 2%; background-color: #00a1cb;color:#fff;border: 0">
      分析
    </button>
    <div id="toolbar"
    class="param-container tool-bar"
    v-show="toolbarFlag"
         >
      <div class="titleBox"
           style="margin-bottom: 10px">
        <div class="titl"
             style="width: 80px;">开敞度分析</div>
        <!-- <span aria-hidden="false"
              class="close2" @click="handleClose">×</span> -->
      </div>
      <div style="font-size: 16px;margin-bottom: 10px">观察者信息：</div>
      <div class="middlebox wdd-bottom">
        <span class="tit">X :</span>
        <input class="middle-input"
               id="longitude"
               step="0.0001"
               type="number"
               @change="handleLongitude($event)"
               :value="viewX" />
      </div>
      <div class="middlebox wdd-bottom">
        <span class="tit">Y :</span>
        <input class="middle-input"
               id="latitude"
               step="0.0001"
               type="number"
               @change="handleLatitude($event)"
               :value="viewY" />
      </div>
      <div class="middlebox wdd-bottom">
        <span class="tit">Z :</span>
        <input class="middle-input"
               id="height"
               min="0"
               step="1"
               @change="handleHeight($event)"
               type="number"
               :value="viewZ" />
      </div>
      <div style="font-size: 16px;margin-bottom: 10px">参数设置：</div>
      <div class="middlebox m wdd-bottom">
        <span class="tit">观察半径:</span>
        <input class="min-solider"
               id="observerRsdius"
               max="1000"
               min="1"
               step="1"
               @change="handleObserverRsdius($event)"
               style="width:45%"
               type="range"
               :value="viewR" />
        <input class="min-solider"
               id="Rsdius"
               max="1000"
               min="1"
               step="1"
               @change="handleObserverRsdius($event)"
               style="width:23%; height:20px ;margin: 0;"
               type="number"
               :value="viewR" />
      </div>
      <div class="middlebox m wdd-bottom">
        <span class="tit">起始角度:</span>
        <input class="min-solider"
               id="StartingAngle"
               max="360"
               min="0"
               step="5"
               @input="handleStartingAngle($event)"
               style="width:45%"
               type="range"
               :value="viewSangle" />
        <input class="min-solider"
               id="Sangle"
               max="360"
               min="0"
               @change="handleStartingAngle($event)"
               step="1"
               style="width:23%; height:20px ;margin: 0;"
               type="number"
               :value="viewSangle" />
      </div>
      <div class="middlebox m wdd-bottom">
        <span class="tit">终止角度:</span>
        <input class="min-solider"
               id="EndAngle"
               max="360"
               min="0"
               step="1"
               style="width:45%"
               type="range"
               @change="handleEndAngle($event)"
               :value="viewEangle" />
        <input class="min-solider"
               id="Eangle"
               max="360"
               min="0"
               step="1"
               @change="handleEndAngle($event)"
               style="width:23%; height:20px ;margin: 0;"
               type="number"
               :value="viewEangle" />
      </div>
      <div class="middlebox m wdd-bottom">
        <span class="">可视部分颜色:</span>
        <el-color-picker @change="handleVisibleColor" v-model="VisibleColor" show-alpha></el-color-picker>
        <!-- <input id="VisibleColor"
               type="color"
               :value="VisibleColor" /> -->
      </div>
      <div class="middlebox m wdd-bottom">
        <span class="">隐藏部分颜色:</span>
        <el-color-picker @change="handleHiddenColor" v-model="HiddenColor" show-alpha></el-color-picker>
        <!-- <input id="HiddenColor"
               type="color"
               :value="HiddenColor" /> -->
      </div>
      <div class="middlebox wdd-bottom">
        <span class="tit">显示类型:</span>
        <el-select v-model="container" placeholder="请选择" @change="handleCalMode1">
            <el-option value="VisiblePart" label="可视部分"></el-option>
            <el-option value="HiddenPart" label="隐藏部分"></el-option>
            <el-option value="ShowAll" label="全部显示"></el-option>
  </el-select>
        <!-- <select class="select-container"
                v-model="container"
                id="calMode1"
                @change="handleCalMode1"
                style="width: 70%">
          <option value="VisiblePart">可视部分</option>
          <option value="HiddenPart">隐藏部分</option>
          <option value="ShowAll">全部显示</option>
        </select> -->
      </div>
      <div style="" class="wdd-bottom">
        <span style="font-size: 16px">是否封口:</span> <input id="isClosed"
               type="checkbox"
               @change="handleIsClosed"
               v-model="isClosed"
               style="margin-left: 10px" />
        <span style="font-size: 10px;margin-left: 5px">(当为360度闭合半球时设置无效)</span>
      </div>
      <div class="boxchild ">
          <el-button @click="analyseActive"
                   type="primary">分析</el-button>
        <el-button @click="clearBtn">清除</el-button>
        <!-- <button class="tbtn tbn1"
                id="active"
                @click="analyseActive"
                type="button">分析</button>
        <button class="tbtn "
                id="clear"
                @click="clear"
                type="button">清除</button> -->
      </div>
    </div>
  </div>
</template>

<script>
import { createTooltip } from '@/assets/js/tooltip.js'

export default {
  data() {
    return {
      viewX: '',
      viewY: '',
      viewZ: '',
      viewR: 100,
      viewSangle: 0,
      viewEangle: 360,
      container: 'VisiblePart',
      isClosed: false,
      loadingbarFlag: true,
      toolbarFlag: true,
      btnFlag: false,
      scene: '',
      handlerPolygon: null,
      shadowQuery: null,
      viewer: null,
      points: '',
    viewDomeArray: [],//存多个开敞度对象数组
    ViewDomeType: 0,//开敞度类型
    iTime: null,
    Time: null,
    handler: null,
    VisibleColor: "#00B7EF",
    HiddenColor: "#E36C09"
    }
  },
  mounted() {
    let that = this
    var viewer = new Cesium.Viewer('cesiumContainer', {
      infoBox: false
    })
    var scene = viewer.scene
    var widget = viewer.cesiumWidget
    try {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.BingMapsImageryProvider({
          key: URL_CONFIG.BING_MAP_KEY, //可至官网（https://www.bingmapsportal.com/）申请key
          url: URL_CONFIG.BINGMAP
        })
      )
      var promise = scene.open(URL_CONFIG.SCENE_CBD)
      Cesium.when(
        promise,
        function(layers) {
          for (var i = 0; i < layers.length; i++) {
            layers[i].selectEnabled = false
          }
          //图层加载完成,设置相机位置
          scene.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(116.4491, 39.9011, 180),
            orientation: {
              heading: 0.0912,
              pitch: -0.3177,
              roll: 0
            }
          })



          that.toolbarFlag = true
          that.loadingbarFlag = false
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
    
    this.scene = scene
    this.viewer = viewer
  },
  methods: {
    //分析
    analyseActive() {
      this.mousestyle()
      this.initViewDome()
      var handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas)
      handler.setInputAction((e) => {
        this.viewer.enableCursorStyle = true
        //$('body').removeClass('drawCur')
        //获取点击位置笛卡尔坐标
        var position = this.scene.pickPosition(e.position)
        //将笛卡尔坐标转化为经纬度坐标
        let positions = []
        var cartographic = Cesium.Cartographic.fromCartesian(position)
        var longitude = Cesium.Math.toDegrees(cartographic.longitude)
        var latitude = Cesium.Math.toDegrees(cartographic.latitude)
        var height = cartographic.height
        if (height < 0) {
          height = 0
        }
        if (
          positions.indexOf(longitude) == -1 &&
          positions.indexOf(latitude) == -1
        ) {
          positions.push(longitude)
          positions.push(latitude)
          positions.push(height)
        }
        //点击位置同步到显示框
        this.viewX = longitude
        this.viewY = latitude
        this.viewZ = height
        console.log(positions)
        this.updateViewDome(positions)
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      this.handler = handler
    },
    clearBtn() {
        if (this.viewDomeArray.length == 0) {
                        return
                    }
                    this.clearFn();
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      
    },
    clearFn() {
        this.viewer.entities.removeAll()
      this.viewDomeArray[this.viewDomeArray.length - 1].destroy() //释放对象
      this.viewDomeArray.pop()
      if (this.viewDomeArray.length == 0) {
        return
      } else {
        let v = this.viewDomeArray[this.viewDomeArray.length - 1]
        // $('#longitude').val(v.viewPosition[0])
        // $('#latitude').val(v.viewPosition[1])
        // $('#height').val(v.viewPosition[2])
        this.viewX = v.viewPosition[0]
        this.viewY = v.viewPosition[1]
        this.viewZ = v.viewPosition[2]
        this.addpoint()
      }
    },
    updateViewDome(p) {
            this.viewDomeArray[this.viewDomeArray.length - 1].viewPosition = p
            this.viewDomeArray[this.viewDomeArray.length - 1].build() //执行开敞度分析
            this.addpoint()
          },
    mousestyle() {
            //鼠标样式
            this.viewer.enableCursorStyle = false
            this.viewer._element.style.cursor = ''
            // $('body')
            //   .removeClass('drawCur')
            //   .addClass('drawCur')
          },
    addpoint() {
        var that = this
            //添加点
            if (
              this.viewX == undefined ||
              this.viewY == undefined ||
              this.viewZ == undefined
            ) {
              return
            }
            //首先移除之前添加的点
            this.viewer.entities.removeAll()
            //在位置添加对应点
            this.viewer.entities.add(
              new Cesium.Entity({
                point: new Cesium.PointGraphics({
                  color: new Cesium.Color(1, 0, 0),
                  pixelSize: 6,
                  outlineColor: new Cesium.Color(0, 1, 1)
                }),
                position: Cesium.Cartesian3.fromDegrees(
                  that.viewX,
                  that.viewY,
                  that.viewZ + 0.5
                )
              })
            )
          },
        handleLongitude(e) {
            this.viewX = e.target.value;
            var longitude = parseFloat(this.viewX)
            if (!longitude) {
              return
            }
            clearTimeout(this.iTime)
            this.iTime = setTimeout(() => {
              this.move()
            }, 1000)
            this.addpoint()
        },
        handleLatitude(e) {
            this.viewY = e.target.value;
            var latitude = parseFloat(this.viewY)
            if (!latitude) {
              return
            }
            clearTimeout(this.iTime)
            this.iTime = setTimeout(() => {
              this.move()
            }, 1000)
            this.addpoint()
        },
        handleHeight(e) {
            this.viewZ = e.target.value;
            var height = parseFloat(this.viewZ)
            if (!height) {
              return
            }
            clearTimeout(this.iTime)
            this.iTime = setTimeout(() => {
              this.move()
            }, 1000)
           this.addpoint()
        },
        handleObserverRsdius(e) {
            this.viewR = e.target.value; 
            if (this.viewDomeArray.length == 0) {
              return
            }
            if (Number(this.viewR) == 0) {
              return
            }
            clearTimeout(this.iTime)
            this.iTime = setTimeout(() => {
              this.viewDomeArray[this.viewDomeArray.length - 1].distance = Number(
                this.viewR
              )
            }, 500)
        },
        handleStartingAngle(e) {
            this.viewSangle = e.target.value; 
            if (this.viewDomeArray.length == 0) {
              return
            }
            clearTimeout(this.iTime)
            this.iTime = setTimeout(() => {
              this.viewDomeArray[this.viewDomeArray.length - 1].startAngle = Number(
                this.viewSangle
              )
            }, 500)
        },
        handleEndAngle(e) {
            this.viewEangle = e.target.value; 
            if (this.viewDomeArray.length == 0) {
              return
            }
            clearTimeout(this.iTime)
            this.iTime = setTimeout(() => {
              this.viewDomeArray[this.viewDomeArray.length - 1].endAngle = Number(
                this.viewEangle
              )
            }, 500)
        },
        handleCalMode1() {
            var index = this.container
            switch (index) {
              case 0:
                this.ViewDomeType = Cesium.ViewDomeType.VISIBLEDOME
                break
              case 1:
                this.ViewDomeType = Cesium.ViewDomeType.HIDDENDOME
                break
              case 2:
                this.ViewDomeType = Cesium.ViewDomeType.ALLDOME
                break
              default:
                break
            }
            if (this.viewDomeArray.length == 0) {
              return
            }
            this.viewDomeArray[this.viewDomeArray.length - 1].domeType = this.ViewDomeType
        },
        handleIsClosed() {
            var isClosed = this.isClosed
            if (isClosed) {
              isClosed = true
            } else {
              isClosed = false
            }
            this.viewDomeArray[this.viewDomeArray.length - 1].isClosed = isClosed
        },
        initViewDome() {
            //初始化
            let VisibleColor = Cesium.Color.fromCssColorString(
              this.VisibleColor
            )
            let HiddenColor = Cesium.Color.fromCssColorString(
              this.HiddenColor
            )
            let viewDome = new Cesium.ViewDome(this.scene) //构造新的开敞度分析对象
            // viewDome.viewPosition = [longitude, latitude, height]; //视点位置，这里用的是CBD示例的中心位置
            viewDome.distance = Number(this.viewR) //可视距离
            viewDome.domeType = this.ViewDomeType //开敞度类型,分为可视部分、不可视部分, 全部显示
            viewDome.visibleAreaColor = Cesium.Color.fromAlpha(
              VisibleColor,
              0.5
            ) //可视部颜色
            viewDome.hiddenAreaColor = Cesium.Color.fromAlpha(HiddenColor, 0.5) //隐藏部分颜色
            viewDome.startAngle = Number(this.viewSangle) //起始角度
            viewDome.endAngle = Number(this.viewEangle) //终止角度
            viewDome.isClosed = isClosed //封口
            // viewDome.build(); //执行开敞度分析
            this.viewDomeArray.push(viewDome)
          },
        move() {
            
            //改变经纬度动态移动
            if (this.viewDomeArray.length == 0) {
              return
            }
            if (this.viewX && this.viewY && this.viewZ) {
              this.viewDomeArray[this.viewDomeArray.length - 1].viewPosition = [
                this.viewX,
                this.viewY,
                this.viewZ
              ]
            }
            clearTimeout(this.Time) //防止点击多次，执行一次
            this.Time = setTimeout(() => {
              this.viewDomeArray[this.viewDomeArray.length - 1].startAngle = Number(
                this.viewSangle
              ) //加这个才起作用
            }, 500)
          },
        //关闭操作框
        handleClose() {
            this.toolbarFlag = false
            this.btnFlag = true
        },
        handleBtnFlag() {
            this.toolbarFlag = true
            this.btnFlag = false
        },
        handleVisibleColor() {
            let VisibleColor = Cesium.Color.fromCssColorString(
              this.VisibleColor
            )
            if (this.viewDomeArray.length == 0) {
              return
            }
            this.viewDomeArray[
               this.viewDomeArray.length - 1
            ].visibleAreaColor = Cesium.Color.fromAlpha(VisibleColor, 0.5) //可视部颜色
        },
        handleHiddenColor() {
            let HiddenColor = Cesium.Color.fromCssColorString(
              this.HiddenColor
            )
            if ( this.viewDomeArray.length == 0) {
              return
            }
             this.viewDomeArray[
               this.viewDomeArray.length - 1
            ].hiddenAreaColor = Cesium.Color.fromAlpha(HiddenColor, 0.5)
        }
  }
}
</script>

<style>
/* .drawCur{
            cursor: url('./../../assets/images/cur/draw.cur'), auto;
        } */
input[type='checkbox'] {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  line-height: 12px;
  border-radius: 2px;
  /*color: #3C8DBC;*/
  border: 1px solid #3c8dbc;
  margin: 0;
}
input[type='checkbox']:checked::before {
  content: '\2713';
  border-color: #3c8dbc;
  color: #3c8dbc;
}
.middlebox .el-color-picker{
    vertical-align: middle;
    margin-left: 10px;
}
</style>
