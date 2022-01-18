<!-- 通视分析 -->
<template>
  <div class="visibility">
    <div id="cesiumContainer"></div>
    <div id="toolbar" class="param-container tool-bar">
        <el-button @click="chooseViewHandle" type="primary">选取观察位置</el-button>
        <el-button @click="addPointHandle" type="primary">添加目标点</el-button>
        <el-button @click="clearBtn">清除</el-button>
      <!-- <button
        type="button"
        id="chooseView"
        @click="chooseViewHandle"
        class="button black"
      >
        选取观察位置
      </button>
      <button
        type="button"
        id="addPoint"
        @click="addPointHandle"
        class="button black"
      >
        添加目标点
      </button>
      <button
        type="button"
        id="clear"
        @click="clearHandle"
        class="button black"
      >
        清除
      </button> -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      handlerPoint: null,
      scene: null,
      viewer: null,
      sightline: null
    };
  },
  mounted() {
    var viewer = new Cesium.Viewer("cesiumContainer");
    viewer.imageryLayers.addImageryProvider(
      new Cesium.BingMapsImageryProvider({
        url: "https://dev.virtualearth.net",
        mapStyle: Cesium.BingMapsStyle.AERIAL,
        key: URL_CONFIG.BING_MAP_KEY
      })
    );
    if (!viewer.scene.pickPositionSupported) {
      alert("不支持深度纹理,通视分析功能无法使用（无法添加观测点目标点）！");
    }
    var scene = viewer.scene;
    scene.shadowMap.darkness = 1.275; //设置第二重烘焙纹理的效果（明暗程度）
    scene.skyAtmosphere.brightnessShift = 0.4; //修改大气的亮度
    scene.debugShowFramesPerSecond = true;
    scene.hdrEnabled = false;
    scene.sun.show = false;
    // 01设置环境光的强度-新处理CBD场景
    
    var sightline = new Cesium.Sightline(scene);
    sightline.couldRemove = false;

    var handlerPoint = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Point);
    var widget = viewer.cesiumWidget;
    handlerPoint.drawEvt.addEventListener(function(result) {
      var point = result.object;
      point.show = false;
      var position = result.object.position;

      //将获取的点的位置转化成经纬度
      var cartographic = Cesium.Cartographic.fromCartesian(position);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);
      var height = cartographic.height;

      if (scene.viewFlag) {
        //设置观察点
        sightline.viewPosition = [longitude, latitude, height];
        scene.viewFlag = false;
      } else {
        //添加目标点
        sightline.addTargetPoint({
          position: [longitude, latitude, height],
          name: "point" + new Date()
        });
        sightline.couldRemove = true;
      }
    });
    this.handlerPoint = handlerPoint;
    try {
      //添加S3M图层
      var ground1Promise = scene.addS3MTilesLayerByScp(
        URL_CONFIG.SCP_CBD_GROUND1,
        { name: "ground1" }
      );
      var buildPromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_BUILD, {
        name: "build"
      });
      var lakePromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_LAKE, {
        name: "lake"
      });
      var treePromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_TREE, {
        name: "tree"
      });
      var roadPromise = scene.addS3MTilesLayerByScp(URL_CONFIG.SCP_CBD_ROAD, {
        name: "road"
      });
      var bridgePromise = scene.addS3MTilesLayerByScp(
        URL_CONFIG.SCP_CBD_BRIDGE,
        { name: "bridge" }
      );
      var promiseSet = [
        ground1Promise,
        buildPromise,
        lakePromise,
        treePromise,
        roadPromise,
        bridgePromise
      ];
      Cesium.when.all(
        promiseSet,
        function(layer) {
          scene.camera.setView({
            destination: new Cesium.Cartesian3.fromDegrees(
              116.44621857300415,
              39.899281526734555,
              216.7793905027196
            ),
            orientation: {
              heading: 0.41348036210986194,
              pitch: -0.13636490404291735,
              roll: 6.283185307179563
            }
          });
          for (var i = 0; i < layer.length; i++) {
            layer[i].selectEnabled = false;
          }

          sightline.build();
        },
        function(e) {
          if (widget._showRenderLoopErrors) {
            var title = "加载SCP失败，请检查网络连接状态或者url地址是否正确？";
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
    this.viewer = viewer;
    this.sightline = sightline;
  },
  methods: {
    chooseViewHandle() {
      if (this.handlerPoint.active) {
        return;
      }
      this.scene.viewFlag = true;
      this.viewer.entities.removeAll();
      if (this.sightline.couldRemove) {
        this.sightline.removeAllTargetPoint();
      }
      this.handlerPoint.activate();
    },
    addPointHandle() {
      this.scene.viewFlag = false;
      this.handlerPoint.activate();
    },
    clearBtn() {
      this.handlerPoint.clear();
      this.viewer.entities.removeAll();
      if (this.sightline.couldRemove) {
        this.sightline.removeAllTargetPoint();
        this.sightline.couldRemove = false;
      }
    }
  }
};
</script>

<style></style>
