app.factory("appService", ["$rootScope", "$q", function($rootScope, $q) {
	var model = null;
	var images = {};
	var showWarning = new Rx.ReplaySubject(1);

	$rootScope.$on("decal-image-added", function(event, image) {
		images[image.id] = image;
	});

	$rootScope.$on("decal-image-removed", function(event, image) {
		delete images[image.id];
	});

	return {
		getModels() {
			/*var req = {
				method: 'POST',
				url: 'http://dev.lithium.pl/perfecta/wp/wp-admin/admin-ajax.php',
				data: $.param({ action: "getModels" }),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}

			return $http(req);*/

			// Mock ↓ (TODO: Na produkcji modele mają być pobieranie z WP)
			return $q(function(resolve, reject) {
				resolve({ data: mock_initModels() });
			});
		},
		getModel() { return model; },
		getImages() { return images; },
		setModel(newModel) {
			model = newModel;
			images = {};
			showWarning = new Rx.ReplaySubject(1);
			$rootScope.$broadcast("model-selected", model);
		},
		orderForm: new Rx.ReplaySubject(1),
		orderOptions: new Rx.ReplaySubject(1),
		showWarning: function() { return showWarning; }
	}
}]);

// Mock ↓ (TODO: Usunąć na produkcji)
function mock_initModels() {
	var models = [];

	var modelTemplate = {
		model3d: {
			top: "",
			bot: "",
			tiles: 0
		},
		title: "Parasol",
		subtitle: "3M/8",
		shape: "suqare",
		price: {
			base: [1234, 2345],
			delivery: [200, 500],
			print: [0.3, 0.25]
		},
		bases: [
			{
				name: "Podstawa B",
				url: "podstawa_B.svg",
				price: 123
			},
			{
				name: "Podstawa G",
				url: "podstawa_G.svg",
				price: 234
			},
			{
				name: "Podstawa H",
				url: "podstawa_H.svg",
				price: 345
			}
		],
		legend: {
			imageUrl: "img/mock/legenda-1.svg",
			params: {
				H1: "283 cm",
				H2: "203 cm",
				H3: "73 cm",
				H4: "213 cm"
			}
		},
		params: {
			weight: "ok. 12.6 kg",
			material: "Lorem Ipsum"
		},
		info: {
			frame: "Aluminium malowane proszkowo w kolorze białym",
			openingImgUrl: "img/mock/otwieranie_dzwignia-1.svg",
			mechanismImgUrl: "img/mock/teleskop_bez-teleskopu.svg",
			topImgUrl: "img/mock/szyt_bez-daszka.svg",
			frillImgUrl: "img/mock/falbany_zfalbana.svg",
			fieldsImgUrl: "img/mock/pola_ogragly8.svg",
			basisImgUrl: "img/mock/podstawa_K.svg"
		}
	};

	var modelsFiles = [
		["2m california", 4, "square"],
		["3,5x3,5", 4, "square"],
		["3x3", 4, "square"],
		["3x3 floryda", 4, "square"],
		["3x3 okragly", 8, "round"],
		["3x3 okragly bez wolantu", 8, "round"],
		["4m floryda", 8, "round"],
		["4x4", 4, "square"],
		["4x8 okragly", 8, "round"],
		["4x8 okragly bez wolantu", 8, "round"],
		["5x5", 4, "square"],
		["5x8 okragly", 8, "round"],
		["5x8 okragly bez wolantu", 8, "round"],
		["7x7", 4, "square"]
	];

	modelsFiles.forEach(file => {
		var model = $.extend(true, {}, modelTemplate);
		model.model3d.top = "models/converted/" + file[0] + " (top).json";
		model.model3d.bot = "models/converted/" + file[0] + " (bot).json";
		model.tiles = file[1];
		model.subtitle = file[0];
		model.shape = file[2];
		models.push(model);
	})

	return models;
}