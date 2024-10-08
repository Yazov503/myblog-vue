<template>
  <div>
    <analog-clock :size=size :scaleType=scaleType :backgroundImage=backgroundImage :borderWidth=borderWidth></analog-clock>
  </div>
</template>

<script>
import { AnalogClock } from 'vue-analog-clock'

export default {
  components: {
    AnalogClock,
  },
  data() {
    return {
      size: 200,
      scaleType: 'roman',
      backgroundImage: '/images/clock_background_image.jpg',
      borderWidth: 5
    }
  },
}

</script>