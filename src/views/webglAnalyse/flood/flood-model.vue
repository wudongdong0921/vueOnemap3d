<template>
  <div>
    <div id="cesiumContainer"></div>
    <div id="loadingbar" v-if="loadingbar" class="spinner">
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
    <div id="toolbar" v-if="toolbar" class="param-container tool-bar">
      <div class="element" id="colorTable" v-if="gorupFlag" title="设置颜色表">
          <div class="form-label">设置颜色表</div>
          <el-dropdown trigger="click"
                       style="width: 100%;"
                       @command="colorTableChange">
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
      </div>
      <div id="setingBar">
        <div class="form-group" v-if="gorupFlag">
            <label class="form-label">最大高度 (米) :</label>
          <input
            id="maxHeight"
            :value="maxValue"
            required="required"
            class="form-control"
          />
          
        </div>
        <div class="form-group" v-if="gorupFlag">
            <label class="form-label">最小高度 (米) :</label>
          <input
            id="minHeight"
            :value="minValue"
            required="required"
            class="form-control"
          />
          
        </div>
        <div class="form-group" v-if="gorupFlag">
            <label class="form-label">淹没速度(米/秒):</label>
          <input
            id="speed"
            :value="speed"
            required="required"
            class="form-control"
          />
          
        </div>
      </div>
      <div>
          
        <el-button @click="beginBtn" type="primary">开始</el-button>
        <el-button @click="clearBtn">清除</el-button>
        <!-- <button type="button" id="begin" @click="beginBtn" class="button black">
          开始
        </button>
        <button type="button" id="clear"  class="button black">
          清除
        </button> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
        band: 'band4',
      gorupFlag: false,
      toolbar: false,
      loadingbar: true,
      colorTable: "4",
      currentHeight: 0,
      maxValue: 71,
      minValue: 1,
      speed: 1,
      scene: "",
      int: ""
    };
  },
  //   mounted () {
  //     var viewer = new Cesium.Viewer("cesiumContainer"); 
  //   },
  components: {},
  mounted() {

var viewer = new Cesium.Viewer('cesiumContainer');
        viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
            url : 'https://dev.virtualearth.net',
            mapStyle : Cesium.BingMapsStyle.AERIAL,
            key : URL_CONFIG.BING_MAP_KEY
        }));
    var scene = viewer.scene;
    this.gorupFlag = true;
    var widget = viewer.cesiumWidget;
    try {
      //添加S3M图层服务
      var promise = scene.open(URL_CONFIG.SCENE_XGPARK);
      Cesium.when(
        promise,
        function(layers) {
            console.log(layers)
          // 设置相机视角，便于查看模型
          scene.camera.setView({
              //相机在WGS84世界坐标系中的最终位置，或是自顶向下视图中可见的矩形区域
            destination: new Cesium.Cartesian3.fromDegrees(
              114.2158,
              22.4169,
              419
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
    this.scene = scene;
    this.toolbar = true;
    this.loadingbar = false;
  },
  methods: {
    //点击“开始”按钮，则开始淹没分析
    beginBtn() {
      this.currentHeight = 0;
      this.int = setInterval(this.flood, 100);
      this.maxValue = parseInt(this.maxValue);
      this.minValue = parseInt(this.minValue);
    },
    //清除分析结果
    clearBtn() {
       
      clearInterval(this.int);
      var layer = this.scene.layers.find("sci_park");
      var hyp = new Cesium.HypsometricSetting();
      hyp.MaxVisibleValue = 0;

      layer.hypsometricSetting = {
        hypsometricSetting: hyp,
        analysisMode: Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
      };
    },
    flood() {
      if (this.currentHeight > this.maxValue) {
        clearInterval(this.int);
        return;
      }
    console.log(this.scene.layers.layerQueue)
      var layer = this.scene.layers.find("sci_park");
      var hyp = new Cesium.HypsometricSetting();

      //创建分层设色对象   设置最大/最小可见高度   颜色表  显示模式   透明度及线宽
      var colorTable = new Cesium.ColorTable();

      hyp.MaxVisibleValue = this.currentHeight;
      hyp.MinVisibleValue = this.minValue;

      var value = this.colorTable;
      this.setColorTable(colorTable, value);

      hyp.ColorTable = colorTable;
      hyp.DisplayMode = Cesium.HypsometricSettingEnum.DisplayMode.FACE;
      hyp.Opacity = 0.5;

      hyp.LineInterval = 10.0;
    console.log(layer)
      //设置图层分层设色属性
      layer.hypsometricSetting = {
        hypsometricSetting: hyp,
        analysisMode: Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
      };
      this.currentHeight += parseInt(this.speed) / 10;
    },
    colorTableChange(command) {
      var layer = this.scene.layers.find("sci_park");
      var value = command;
        this.band = 'band' + value
      var hyp = new Cesium.HypsometricSetting();

      //创建分层设色对象   设置最大/最小可见高度   颜色表  显示模式   透明度及线宽
      var colorTable = new Cesium.ColorTable();

      hyp.MaxVisibleValue = this.currentHeight;
      hyp.MinVisibleValue = this.minValue;
      this.setColorTable(colorTable, value);

      hyp.ColorTable = colorTable;
      hyp.DisplayMode = Cesium.HypsometricSettingEnum.DisplayMode.FACE;
      hyp.Opacity = 0.5;

      hyp.LineInterval = 10.0;
      //设置图层分层设色属性
      layer.hypsometricSetting = {
        hypsometricSetting: hyp,
        analysisMode: Cesium.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
      };
    },
    setColorTable(colorTable, key) {
      switch (key) {
        case "1":
          colorTable.insert(71, new Cesium.Color(0, 39 / 255, 148 / 255));
          colorTable.insert(
            0,
            new Cesium.Color(149 / 255, 232 / 255, 249 / 255)
          );
          break;
        case "2":
          colorTable.insert(
            71,
            new Cesium.Color(162 / 255, 251 / 255, 194 / 255)
          );
          colorTable.insert(0, new Cesium.Color(1, 103 / 255, 103 / 255));
          break;
        case "3":
          colorTable.insert(71, new Cesium.Color(230 / 255, 198 / 255, 1));
          colorTable.insert(0, new Cesium.Color(157 / 255, 0, 1));
          break;
        case "4":
          colorTable.insert(
            71,
            new Cesium.Color(210 / 255, 15 / 255, 15 / 255)
          );
          colorTable.insert(
            54,
            new Cesium.Color(221 / 255, 224 / 255, 7 / 255)
          );
          colorTable.insert(
            36,
            new Cesium.Color(20 / 255, 187 / 255, 18 / 255)
          );
          colorTable.insert(18, new Cesium.Color(0, 161 / 255, 1));
          colorTable.insert(0, new Cesium.Color(9 / 255, 9 / 255, 212 / 255));
          break;
        case "5":
          colorTable.insert(71, new Cesium.Color(186 / 255, 1, 229 / 255));
          colorTable.insert(
            0,
            new Cesium.Color(26 / 255, 185 / 255, 156 / 255)
          );
          break;
        default:
          break;
      }
    }
  }
};
</script>
<style>
.bootstrap-select:not([class*="col-"]):not([class*="form-control"]):not(.input-group-btn) {
  width: 170px;
}
.form-group::before {
  content: attr(data-foo);
  color: black;
}
#setingBar {
  width: 220px;
  background: rgba(42, 42, 42, 0.4);
  border-radius: 4px;
  color: #fff;
}

.param-container {
  background-color: rgba(38, 38, 38, 0.75);
  padding: 20px 20px 10px 20px;
  color: #ffffff;
  border: 1px solid #526f82;
}
.band1 {
  background: -webkit-linear-gradient(left, #95e8f9, #002794) !important;
}
.band2 {
  background: -webkit-linear-gradient(left, #a2fbc2, #ff6767) !important;
}
.band3 {
  background: -webkit-linear-gradient(left, #e6c6ff, #9d00ff) !important;
}
.band4 {
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
.element{
    margin-bottom: 1rem;
}
</style>
