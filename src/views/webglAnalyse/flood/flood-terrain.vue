<template>
  <div>
    <div id="cesiumContainer"></div>
    <div id="loadingbar"
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
         class="param-container tool-bar">
      <div class="form-group">
        <label class="form-label">最大高度 (米) :</label>
        <input id="maxHeight"
               :value="maxValue"
               @change="handleMaxValue($event)"
               class="form-control" />

      </div>
      <div class="form-group">
        <label class="form-label">最小高度 (米) :</label>
        <input id="minHeight"
               :value="minValue"
                @change="handleMinValue($event)"
               class="form-control" />

      </div>
      <div class="form-group">
        <label class="form-label">淹没速度(米/秒):</label>
        <input id="speed"
               :value="speed"
               required="required"
               class="form-control" />

      </div>
      <div class="wdd-bottom">
        <el-button @click="handlePolypon"
                   type="primary">绘制面</el-button>
        <el-button @click="handleLine"
                   type="primary">测距</el-button>
        <el-button @click="handlePolyponMear"
                   type="primary">测面</el-button>
        <el-button @click="handleHeightMear"
                   type="primary">测高</el-button>
        <!-- <button type="button" @click="handlePolypon" class="button black">
          绘制面
        </button>
        <button type="button" @click="handleLine" class="button black">
          测距
        </button>
        <button type="button" @click="handlePolyponMear" class="button black">
          测面
        </button>
        <button type="button" @click="handleHeightMear" class="button black">
          测高
        </button> -->
      </div>
      <div class="wdd-bottom">
        <select id="selOpt"
                v-model="selOptV"
                class="selectpicker show-tick form-control">
          <option selected
                  value="1">空间量算</option>
          <option value="2">贴地量算</option>
          <option value="3">CGCS2000(国情)</option>
          <option value="4">Xi-An1980(国情)</option>
          <option value="5">平面投影(三调)</option>
        </select>
      </div>
      <div style="">
        <el-button @click="beginBtn"
                   type="primary">开始</el-button>
        <el-button @click="clearBtn">清除</el-button>
        <!-- <button type="button" id="begin" @click="beginBtn" class="button black">
          开始
        </button>
        <button type="button" id="clear" @click="clearBtn" class="button black">
          清除
        </button> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      maxValue: 6000,
      minValue: 4000,
      speed: 500,
      scene: '',
      hyp: null,
      int: null,
      currentHeight: 0,
      positions: null,
      polygonHandler: null,
      lineHandler: null,
      polygonMear: null,
      heightMear: null,
      viewer: null,
      selOptV: 3,
      clampMode: 0
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

    //设置相机视角
    viewer.scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(88.3648, 29.0946, 90000),
      orientation: {
        heading: 6.10547067016156,
        pitch: -0.8475077031996778,
        roll: 6.2831853016686185
      }
    })
    //var tooltip = createTooltip(document.body);
    //初始化测量高度
    var heightMear = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.DVH)
    heightMear.measureEvt.addEventListener(function(result) {
      var distance =
        result.distance > 1000
          ? (result.distance / 1000).toFixed(2) + 'km'
          : result.distance + 'm'
      var vHeight =
        result.verticalHeight > 1000
          ? (result.verticalHeight / 1000).toFixed(2) + 'km'
          : result.verticalHeight + 'm'
      var hDistance =
        result.horizontalDistance > 1000
          ? (result.horizontalDistance / 1000).toFixed(2) + 'km'
          : result.horizontalDistance + 'm'
      heightMear.disLabel.text = '空间距离:' + distance
      heightMear.vLabel.text = '垂直高度:' + vHeight
      heightMear.hLabel.text = '水平距离:' + hDistance
    })
    heightMear.activeEvt.addEventListener(function(isActive) {
      if (isActive == true) {
        viewer.enableCursorStyle = false
        viewer._element.style.cursor = ''
      } else {
        viewer.enableCursorStyle = true
      }
    })
    this.heightMear = heightMear
    //测面
    var polygonMear = new Cesium.MeasureHandler(
      viewer,
      Cesium.MeasureMode.Area,
      this.clampMode
    )
    polygonMear.measureEvt.addEventListener(function(result) {
      var mj = Number(result.area)
      var positions = result.positions
      if (that.selOptV == 3 || that.selOptV == 4) {
        mj = Number(that.calcClampValue(positions))
      } else if (that.selOptV == 5) {
        mj = Number(that.calcAreaWithoutHeight(positions))
      }
      var area =
        mj > 1000000 ? (mj / 1000000).toFixed(2) + 'km²' : mj.toFixed(2) + '㎡'
      polygonMear.areaLabel.text = '面积:' + area
    })
    polygonMear.activeEvt.addEventListener(function(isActive) {
      if (isActive == true) {
        viewer.enableCursorStyle = false
        viewer._element.style.cursor = ''
      } else {
        viewer.enableCursorStyle = true
      }
    })
    this.polygonMear = polygonMear
    //测距
    var lineHandler = new Cesium.MeasureHandler(
      viewer,
      Cesium.MeasureMode.Distance,
      this.clampMode
    )
    lineHandler.measureEvt.addEventListener(function(result) {
      var dis = Number(result.distance)
      var selOptV = 3
      var positions = result.positions
      if (selOptV == 3 || selOptV == 4) {
        dis = Number(that.calcClampDistance(positions))
      }
      var distance =
        dis > 1000 ? (dis / 1000).toFixed(2) + 'km' : dis.toFixed(2) + 'm'
      lineHandler.disLabel.text = '距离:' + distance
    })
    lineHandler.activeEvt.addEventListener(function(result) {
      if (result == true) {
        viewer.enableCursorStyle = false
        viewer._element.style.cursor = ''
      } else {
        viewer.enableCursorStyle = true
      }
    })
    lineHandler.deactivate()
    this.lineHandler = lineHandler
    //绘制多边形
    var polygonHandler = new Cesium.DrawHandler(
      viewer,
      Cesium.DrawMode.Polygon,
      this.clampMode
    )
    
    //绘制激活
    polygonHandler.activeEvt.addEventListener(function(res) {
      if (res == true) {
        viewer.enableCursorStyle = false
        viewer._element.style.cursor = ''
      } else {
        viewer.enableCursorStyle = true
      }
    })
    
    polygonHandler.movingEvt.addEventListener(function(res) {})
    polygonHandler.drawEvt.addEventListener(function(polygon) {
      var array = [].concat(polygon.object.positions)
      that.positions = []
      for (var i = 0, len = array.length; i < len; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(array[i])
        var longitude = Cesium.Math.toDegrees(cartographic.longitude)
        var latitude = Cesium.Math.toDegrees(cartographic.latitude)
        var h = cartographic.height
        if (
          that.positions.indexOf(longitude) == -1 &&
          that.positions.indexOf(latitude) == -1
        ) {
          that.positions.push(longitude)
          that.positions.push(latitude)
          that.positions.push(h)
        }
      }
      polygonHandler.deactivate()
      polygonHandler.activate()
    })
    this.polygonHandler = polygonHandler
    this.scene = scene
    this.viewer = viewer
    if (!this.scene.pickPositionSupported) {
      alert('不支持深度拾取,淹没分析功能无法使用（无法交互绘制面）！')
    }
  },
  methods: {
    //
    handleMaxValue(e) {
        
        this.maxValue = parseInt(e.target.value)
    },
    handleMinValue(e) {
        this.minValue = parseInt(e.target.value)
    },
    calcClampValue(positions) {
      var lonlat = []
      var value = 0
      for (var i = 0; i < positions.length; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(positions[i])
        var lon = Cesium.Math.toDegrees(cartographic.longitude)

        var lat = Cesium.Math.toDegrees(cartographic.latitude)
        lonlat.push(lon, lat)
      }

      var gemetry = new Cesium.PolygonGeometry.fromPositions({
        positions: Cesium.Cartesian3.fromDegreesArray(lonlat)
      })
      if (this.selOptV == 3) {
        value = this.scene.globe.computeSurfaceArea(
          gemetry,
          Cesium.Ellipsoid.CGCS2000
        )
      } else if (this.selOptV == 4) {
        value = this.scene.globe.computeSurfaceArea(
          gemetry,
          Cesium.Ellipsoid.XIAN80
        )
      }
      return value
    },
    //
    calcAreaWithoutHeight(positions) {
      var totalLon = 0
      for (var i = 0; i < positions.length; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(positions[i])
        var lon = Cesium.Math.toDegrees(cartographic.longitude)
        totalLon += lon
      }

      var dh = Math.round((totalLon / positions.length + 6) / 6) //带号
      var centralMeridian = dh * 6 - 3
      //高斯投影
      var projection = new Cesium.CustomProjection({
        name: 'tmerc',
        centralMeridian: centralMeridian,
        primeMeridian: 0,
        standardParallel_1: 0,
        standardParallel_2: 0,
        eastFalse: 500000.0,
        northFalse: 0.0,
        semimajorAxis: 6378137,
        inverseFlattening: 298.257222101
      })
      var cartesians = []
      for (var i = 0; i < positions.length; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(positions[i])

        var cartesian = projection.project(cartographic)
        cartesians.push(cartesian)
      }

      cartesians.push(cartesians[0]) //首尾相接
      var value = Cesium.getPreciseArea(
        cartesians,
        'China2000',
        centralMeridian,
        dh,
        1
      )
      return value
    },
    //根据画线的坐标转换-弧度转换为角度
    calcClampDistance(positions) {
      var lonlat = []
      var value = 0
      for (var i = 0; i < positions.length; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(positions[i])
        var lon = Cesium.Math.toDegrees(cartographic.longitude)

        var lat = Cesium.Math.toDegrees(cartographic.latitude)
        lonlat.push(lon, lat)
      }
      var gemetry = new Cesium.PolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(lonlat)
      })

      var selOptV = 3
      if (selOptV == 3) {
        value = this.scene.globe.computeSurfaceDistance(
          gemetry,
          Cesium.Ellipsoid.CGCS2000
        )
      } else if (selOptV == 4) {
        value = this.scene.globe.computeSurfaceDistance(
          gemetry,
          Cesium.Ellipsoid.XIAN80
        )
      }
      return value
    },
    beginBtn() {
      this.currentHeight = 0

      this.currentHeight = this.minValue
      if (!this.positions) {
        var defaultpositions = [
          87.92970568741808,
          29.648196751042956,
          5365.623501858622,
          88.24404154374791,
          30.043454220083056,
          5084.998086332863,
          88.39546146007626,
          29.60273373846709,
          5235.04766490179
        ]
        this.flood(defaultpositions)
        return false
      }
      this.flood(this.positions)
      this.polygonHandler.polygon.show = false
      this.polygonHandler.polyline.show = false
    },
    clearBtn() {
      clearInterval(this.int)
    //   var hyp = new Cesium.HypsometricSetting()
      this.hyp.MaxVisibleValue = 0
      this.viewer.scene.globe.HypsometricSetting = {
        hypsometricSetting: this.hyp,
        analysisMode: Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
      }
      this.polygonHandler.clear()
      this.lineHandler.clear()
      this.polygonMear.clear()
      this.heightMear.clear()
    },
    //返回随机颜色
    getRandomColor() {
      return new Cesium.Color(Math.random(), Math.random(), Math.random())
    },
    flood(positions) {
      //创建分层设色对象
      var hyp = new Cesium.HypsometricSetting()
      //设置显示模式
      hyp.DisplayMode = Cesium.HypsometricSettingEnum.DisplayMode.FACE
      //设置线颜色为红色
      hyp._lineColor = new Cesium.Color(1.0, 0.0, 0.0, 1.0)
      //设置最大/最小可见高度
      hyp.MinVisibleValue = this.minValue
      //设置颜色表的最大/最小key值,表示高度
      hyp.ColorTableMinKey = 1
      hyp.ColorTableMaxKey = 9000
      //新建颜色表
      var colorTable = new Cesium.ColorTable()
      var height = 1
      //每隔200m向颜色表插入一个随机色
      for (var i = 0; i < 90; i++) {
        height += 200
        colorTable.insert(height, this.getRandomColor())
      }

      hyp.ColorTable = colorTable
      hyp.Opacity = 0.8
      //等高线间隔为200m
      hyp.LineInterval = 200.0
      this.positions = positions
      this.hyp = hyp
      this.int = setInterval(this.floodParam, 100)
    },
    floodParam() {
      if (this.currentHeight > this.maxValue) {
        clearInterval(this.int)
        return false
      }
      this.hyp.MaxVisibleValue = this.currentHeight
      this.hyp.CoverageArea = this.positions
      this.viewer.scene.globe.HypsometricSetting = {
        hypsometricSetting: this.hyp,
        analysisMode:
          Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_REGION
      }
      this.currentHeight += parseInt(this.speed) / 10
    },
    handlePolypon() {
      this.deactiveAll()
      this.polygonHandler.activate()
    },
    handleLine() {
      this.deactiveAll()
      this.lineHandler.activate()
    },
    handlePolyponMear() {
      this.deactiveAll()
      this.polygonMear.activate()
    },
    handleHeightMear() {
      this.deactiveAll()
      this.heightMear.activate()
    },
    deactiveAll() {
      this.polygonMear && this.polygonMear.deactivate()
      this.polygonHandler && this.polygonHandler.deactivate()
      this.lineHandler && this.lineHandler.deactivate()
      this.heightMear && this.heightMear.deactivate()
    }
  }
}
</script>

<style></style>
