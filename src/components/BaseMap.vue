<template>
    <div id="map">
    </div>
</template>
<script>
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Map, View } from "ol";
import {defaults as defaultControls} from "ol/control"
export default {
    data(){
        return {
            map: null,
        }
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap(){
            this.map = new Map({
                target: "map", // 指向对象
                layers: [
                    // 图层
                    new TileLayer({
                        // 这里定义的是平铺图层
                        source: new OSM(),
                    }),
                ],
                view: new View({
                    projection: "EPSG:4326",
                    center: [118.792207, 32.133476],
                    zoom: 5,

                }),
                controls: defaultControls({
                    zoom: false
                })
            })
        }
    }
}
</script>
<style lang="less" scoped>
    #map {
        width: 100%;
        height: 100%;
    }
</style>
