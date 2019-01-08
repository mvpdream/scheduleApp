<template>
	<view class="spinner1">
		<div class="rect1"></div>
		<div class="rect2"></div>
		<div class="rect3"></div>
		<div class="rect4"></div>
		<div class="rect5"></div>
		<div class="rect6"></div>
	</view>
</template>

<script>
	export default {
		props: {
			data: {
				type: Object,
				default: function(e) {
					return {}
				}
			}
		},
		computed: {

		},
		methods: {

		}
	}
</script>

<style>
	.spinner1 {
		margin: 5px auto;
		width: 100%;
		height: 30px;
		text-align: center;
		font-size: 10px;
	}

	.spinner1>div {
		background-color: #BEBEBE;
		height: 100%;
		width: 6px;
		margin: 2px;
		display: inline-block;
		-webkit-animation: stretchdelay 1.2s infinite ease-in-out;
		animation: stretchdelay 1.2s infinite ease-in-out;
	}

	.spinner1 .rect2 {
		-webkit-animation-delay: -1.1s;
		animation-delay: -1.1s;
	}

	.spinner1 .rect3 {
		-webkit-animation-delay: -1.0s;
		animation-delay: -1.0s;
	}

	.spinner1 .rect4 {
		-webkit-animation-delay: -0.9s;
		animation-delay: -0.9s;
	}

	.spinner1 .rect5 {
		-webkit-animation-delay: -0.8s;
		animation-delay: -0.8s;
	}

	.spinner1 .rect6 {
		-webkit-animation-delay: -0.7s;
		animation-delay: -0.7s;
	}

	@-webkit-keyframes stretchdelay {

		0%,
		40%,
		100% {
			-webkit-transform: scaleY(0.4)
		}

		20% {
			-webkit-transform: scaleY(1.0)
		}
	}

	@keyframes stretchdelay {

		0%,
		40%,
		100% {
			transform: scaleY(0.4);
			-webkit-transform: scaleY(0.4);
		}

		20% {
			transform: scaleY(1.0);
			-webkit-transform: scaleY(1.0);
		}
	}
</style>
