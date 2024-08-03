<!-- slider for waver period -->
<input type="range" min="5" max="20" step="1" bind:value={selectedPeriod} />
<div class="size-s mb-5">Wave period: {selectedPeriod} seconds</div>
{#if !error}
    <small class="size-xxs mt-5">
        Wave propegation plugin provided by <a href="https://github.com/laagveen/windy-plugin-template" class="clickable dotted" target="_top">Laagveen</a>
    </small>
{:else}
    <small class="rounded-box bg-error size-s mt-10">
        Error: {error}
    </small>
{/if}

<script lang="ts">
    import store from '@windy/store';
    import { map } from '@windy/map';
    import { onDestroy, onMount } from 'svelte';
    import type { LatLon } from '@windy/interfaces'
    import broadcast from '@windy/broadcast';
    
    let selectedPeriod: number = 7;
    
    let markers: L.Marker[] = [];
    let buoys: L.Marker[] = [];
    // list of circles
    let circles: L.Circle[] = [];

    let error: string | null = null;

    // struct for mode visibility none, picker or detail
    let mode: string = 'none';

    const onPluginClose = (pluginName: string) => {
        if(pluginName === 'picker') {
            pickerActive = false;
        }
        if(pluginName === 'detail') {
            detailActive = false;
        }

        updateUI(selectedPeriod);
    }

    // pluginclose listener
    broadcast.on('pluginClosed', onPluginClose);

    const onPluginOpen = (pluginName: string) => {
        if(pluginName === 'picker') {
            pickerActive = true;
        }
        if(pluginName === 'detail') {
            detailActive = true;
        }

        updateUI(selectedPeriod);
    }

    // pluginclose listener
    broadcast.on('pluginOpened', onPluginOpen);

    let pickerActive : boolean = false;
    let detailActive : boolean = false;

    onMount(() => {
        console.log('onMount');
        // add marker at Lengtegraad 3.80994° Breedtegraat 	55.39882° for a12 buor
        buoys.push(L.marker([55.39882, 3.80994], { icon: L.divIcon({ html: `<div>A12</div>`, iconSize: [16, 16], iconAnchor: [8, 24]})}).addTo(map));
        // add marker for j4
        buoys.push(L.marker([53.82, 2.95], { icon: L.divIcon({ html: `<div>J4</div>`, iconSize: [16, 16], iconAnchor: [8, 24]})}).addTo(map));
        // add marker for k13
        buoys.push(L.marker([53.22, 3.22], { icon: L.divIcon({ html: `<div>K13</div>`, iconSize: [16, 16], iconAnchor: [8, 24]})}).addTo(map));

        if(store.get('pickerLocation')) {
            pickerLocation = store.get('pickerLocation');
            pickerActive = true;
        }
        else if(document.getElementById('plugin-detail')) {
            if(store.get('detailLocation')) {
                detailLocation = store.get('detailLocation');
                detailActive = true;
            }
        }
        
        updateUI(selectedPeriod);
    });

    onDestroy(() => {
        console.log('onDestroy');
        removeCircles();
        broadcast.off('pluginClosed', onPluginClose);
        broadcast.off('pluginOpened', onPluginOpen);
        store.off('pickerLocation', onPickerLocation);
        store.off('detailLocation', onDetailLocation);

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
 
    let pickerLocation : LatLon | null;
    let detailLocation : LatLon | null;

    const onPickerLocation = (latLon: LatLon) => {
        console.log('pickerLocation', latLon);
        pickerLocation = latLon;
        updateUI(selectedPeriod);
    }

    store.on('pickerLocation', onPickerLocation);

    const onDetailLocation = (latLon: LatLon) => {
        console.log('detailLocation', latLon);
        detailLocation = latLon;
        updateUI(selectedPeriod);
    }

    store.on('detailLocation', onDetailLocation);

    $: updateUI(selectedPeriod);
    const updateUI = (selectedPeriod: number) => {
        // print all relevant variables
        console.log('updateUI: pickerLocation', pickerLocation);
        console.log('updateUI: detailLocation', detailLocation);
        console.log('updateUI: pickerActive', pickerActive);
        console.log('updateUI: detailActive', detailActive);
        console.log('updateUI: mode', mode);
        
        if(detailActive && !pickerActive  && detailLocation) {
            mode = 'detail';
            //const detailLocation : LatLon | null = store.get('detailLocation');
            console.log('updateUI: detailLocation', detailLocation);
            if(detailLocation) {
                drawMarkerAndCircle(detailLocation, selectedPeriod);
            }
        } else if(!detailActive && pickerActive && pickerLocation) {
            mode = 'picker';
            //const pickerLocation : LatLon | null = store.get('pickerLocation');
            console.log('updateUI: pickerLocation', pickerLocation);
            if(pickerLocation) {
                drawMarkerAndCircle(pickerLocation, selectedPeriod);
            }
        } else if (!detailActive && !pickerActive && mode !== 'none') {
            mode = 'none';
            const latLon : LatLon = { lat: -1, lon: -1 };
            console.log('updateUI: none', latLon);
            drawMarkerAndCircle(latLon, selectedPeriod);
        }

        console.log('end updateUI: pickerLocation', pickerLocation);
        console.log('endupdateUI: detailLocation', detailLocation);
        console.log('end updateUI: pickerActive', pickerActive);
        console.log('end updateUI: detailActive', detailActive);
        console.log('end updateUI: mode', mode);

    }

    const drawMarkerAndCircle = ( latLon: LatLon, period: number) => {
        removeCircles();

        if(!latLon || latLon.lat === -1 || latLon.lon === -1) {
            return;
        }

        const { lat, lon } = latLon;
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

    //$: drawMarkerAndCircle(pickerLocation, selectedPeriod);

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