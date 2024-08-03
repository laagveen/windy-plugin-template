<!-- slider for waver period -->
<input type="range" min="5" max="20" step="1" bind:value={selectedPeriod} />
<div class="size-s mb-5">Wave period: {selectedPeriod} seconds</div>
{#if !error}
    <small class="size-xxs mt-5">
        Wave propegation provided by <a href="https://www.openaip.net/" class="clickable dotted" target="_top">Me</a>
    </small>
{:else}
    <small class="rounded-box bg-error size-s mt-10">
        Error: {error}
    </small>
{/if}

<script lang="ts">
    import store from '@windy/store';
    // import store from '@windy/store';
    // import { map } from '@windy/map';
    import { map, markers } from '@windy/map';
    //import { countries } from "./countries";
    import { singleclick } from '@windy/singleclick';
    //import { setUrl } from "@windy/location";
    
    import { onDestroy, onMount } from 'svelte';
    import type { LatLon } from '@windy/interfaces'
    // get store

    
    import config from './pluginConfig';
    const { name } = config;

    let selectedLat: number = -1;
    let selectedLon: number = -1;
    let selectedPeriod: number = 7;
    
    let markers: L.Marker[] = [];
    let buoys: L.Marker[] = [];
    // list of circles
    let circles: L.Circle[] = [];

    let error: string | null = null;

    // setlocation is called when user clicks on the map
    const setLocation = (latLon: LatLon) => {
        const { lat, lon } = latLon;
        selectedLat = lat;
        selectedLon = lon;

        removeCircles();

    }

    const onMapClick = (e: L.LeafletMouseEvent) => {
        setLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
    }

    onMount(() => {
        //singleclick.on(name, setLocation);
        map.on('click', onMapClick);

        // add marker at Lengtegraad 3.80994° Breedtegraat 	55.39882° for a12 buor
        buoys.push(L.marker([55.39882, 3.80994], { icon: L.divIcon({ html: `<div>A12</div>`, iconSize: [16, 16], iconAnchor: [8, 24]})}).addTo(map));
        // add marker for j4
        buoys.push(L.marker([53.82, 2.95], { icon: L.divIcon({ html: `<div>J4</div>`, iconSize: [16, 16], iconAnchor: [8, 24]})}).addTo(map));
        // add marker for k13
        buoys.push(L.marker([53.22, 3.22], { icon: L.divIcon({ html: `<div>K13</div>`, iconSize: [16, 16], iconAnchor: [8, 24]})}).addTo(map));

    });

    onDestroy(() => {
        //singleclick.off(name, setLocation);
        map.off('click', onMapClick);
        removeCircles();

        buoys.forEach(buoy => buoy.remove());
        buoys = [];
    });

    // speed of ocean waves in m/s as function of period
    // c=gT​/2π is a good approximation for deep water waves, 
    const waveSpeed = (period: number) => {
        return 1.56 * period;
    }

    // distance of wave traveled given a period in seconds and time traveled in seconds
    const waveDistance = (period: number, time: number) => {
        return waveSpeed(period) * time;
    }

    // distance of wave traveled given a period in seconds and time traveled in hours
    const waveDistanceHours = (period: number, time: number) => {
        return waveDistance(period, time * 3600);
    }

    const setPickerLocation = (latLon: LatLon) => {
        if(!latLon) {
            return;
        }
        pickerLocation = latLon;
    }

    let pickerLocation : LatLon = { lat: -1, lon: -1 };
    setPickerLocation(store.get('pickerLocation'));
    setPickerLocation(store.get('detailLocation'));

    store.on('pickerLocation', (latLon: LatLon) => {
        setPickerLocation(latLon);
    });

    store.on('detailLocation', (latLon: LatLon) => {
        setPickerLocation(latLon);
    });

    $: drawMarkerAndCircle(pickerLocation, selectedPeriod);

    const removeCircles = () => {
        if(markers) {
            markers.forEach(marker => marker.remove());
            markers = [];
        }
        if(circles) {
            circles.forEach(circle => circle.remove());
            circles = [];
        }
    }

    const drawMarkerAndCircle = ( latLon: LatLon, period: number) => {
        removeCircles();

        if(!latLon || latLon.lat === -1 || latLon.lon === -1) {
            return;
        }

        const { lat, lon } = latLon;

        //marker = new L.Marker({ lat, lng: lon },{ icon: markers.pulsatingIcon }).addTo(map);

        // add three hour circle
        addCircleAndMarker(lat, lon, waveDistanceHours(period, 3), 3);

        // draw circles for every 6 hours of wave travel
        for (let i = 0; i < 4; i++) {
            const range : number = waveDistanceHours(period, (i + 1) * 6);
            addCircleAndMarker(lat, lon, range, (i + 1) * 6);
        }

        addCircleAndMarker(lat, lon, waveDistanceHours(period, 36), 36);
        addCircleAndMarker(lat, lon, waveDistanceHours(period, 48), 48);
    }

    // function to add a circle with marker on the map
    // extrated from for loop
    const addCircleAndMarker = (lat: number, lon: number, range: number, hours: number) => {
        circles.push(new L.Circle({ lat, lng: lon }, range, {stroke: 1, color: '#000000', opacity: 0.25, fill: false} ).addTo(map));
        const radius_degrees = range / 111320;

        // Calculate new latitude for the marker
        const lat_marker = lat + radius_degrees;
        const lon_marker = lon; // same longitude

        // Add the marker to the map at the new position
        markers.push(L.marker([lat_marker, lon_marker], { icon: L.divIcon({ html: `<div>${hours}h</div>`, iconSize: [16, 16], iconAnchor: [8, 20]})}).addTo(map));
    }
    

</script>

<style lang="less">
    small {
        display: block;
        line-height: 1.5;
    }

    select {
        &:focus {
            outline: none;
        }
    }
</style>