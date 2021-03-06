/*

Digital Lightbox | Giancarlo Buomprisco, 2013.
https://github.com/Gbuomprisco/Digital-Lightbox/tree/development
giancarlobuomprisco.com

*/


$(document).ready(function() {

	(function() {

		var default_options = {
			input: '#search'
		};

		var search = {
			first_requestRunning: false,

			init: function() {
				if (this.first_requestRunning) { // don't do anything if an AJAX request is pending
					return;
				}
				var input = $(default_options.input);
				var button = $('#search_button');
				var n = 6;
				var ajax_loader = $('#ajax-loader');
				var images_container = $('#images_container');

				function load_data() {
					var data = {
						'pattern': input.val(),
						'n': n
					};

					if ($.trim(data.pattern)) {
						$.ajax({
							type: 'POST',
							url: 'search/',
							data: data,
							beforeSend: function() {
								ajax_loader.fadeIn();
							},
							success: function(data) {
								console.log(data)
								if (data != "False" && data.count && data.manuscripts.length) {
									var images = '';
									var count = data['count'];
									var data_manuscripts = data['manuscripts'];
									for (i = 0; i < data_manuscripts.length; i++) {
										var title = data_manuscripts[i][2] + ', ' + data_manuscripts[i][4];
										images += '<div data-toggle="tooltip" title="' + title + '"  data-size = "' + data_manuscripts[i][5] + '" data-title = "' + data_manuscripts[i][2] + '" class="col-lg-4 col-md-4 col-xs-4 image" id = "' + data_manuscripts[i][1] + '">' + data_manuscripts[i][0] + '</div>';
									}
									images_container.html(images);

									$('#results_counter').hide().fadeIn().html("<span class='label label-default'>Results: " + count + "</span>");

									$(".image[data-toggle='tooltip']").tooltip({
										"placement": "bottom"
									});

								} else {
									$('#results_counter').hide().fadeIn().html("<span class='label label-default'>Results: 0</span>");
									images_container.html("<h4 style='margin:1%'>No results found</h4>");
									ajax_loader.fadeOut();
								}
							},
							complete: function() {
								this.first_requestRunning = false;
								var images_element = $('.image');

								images_element.click(function() {
									$lightbox.imagesBox.select_image($(this));
								});

								$('#load_more').attr('disabled', false).click(load_scroll);

								images_container.data('requestRunning', false);

								function load_scroll() {
									if ($(this).data('requestRunning')) { // don't do anything if an AJAX request is pending
										return;
									}

									data.x = data.n;
									data.n += 6;

									$.ajax({
										type: 'POST',
										url: 'search/',
										data: data,
										beforeSend: function() {
											ajax_loader.fadeIn();
										},
										success: function(data) {
											var images = '';
											if (data != "False") {
												data = data['manuscripts'];
												for (var i = 0; i < data.length; i++) {
													var title = data[i][2] + ', ' + data[i][4];
													images += '<div data-toggle="tooltip" title="' + title + '" data-size = "' + data[i][5] + '" data-title = "' + data[i][2] + '" class="col-lg-4 col-md-4 col-xs-4 image" id = "' + data[i][1] + '">' + data[i][0] + '</div>';
												}

												images_container.append(images);

											} else {

												$.fn.notify({
													"close-button": true,
													"type": "error",
													'text': 'You should insert at least one search term',
													"position": {
														'top': "8%",
														'left': '79%'
													}
												});

												ajax_loader.fadeOut();

											}
										},
										complete: function(data) {
											$(this).data('requestRunning', false);
											var image_elements = $('.image');

											image_elements.unbind('click');

											image_elements.click(function() {
												$lightbox.imagesBox.select_image($(this));
											});

											image_elements.find('img').on('load', function() {

												$(".image[data-toggle='tooltip']").tooltip({
													"placement": "bottom"
												});

												ajax_loader.fadeOut();

												image_elements.find('img').fadeIn();

											});
										}

									});
								}

								function isScrollBottom(div) {
									if ((div.scrollTop + div.clientHeight == div.scrollHeight) || (div.scrollTop + div.clientHeight > div.scrollHeight)) {
										return true;
									}
								}
								var div = document.getElementById('images_container');

								images_container.scroll(function() {
									if (isScrollBottom(div)) {
										load_scroll();
										ajax_loader.fadeOut();
									}
								});

								$(this).data('requestRunning', true);

								$('.image').find('img').on('load', function() {
									ajax_loader.fadeOut();
									$(this).fadeIn();
								});

							},

							error: function() {

								$.fn.notify({
									"close-button": true,
									'text': 'Something went wrong. Try again.',
									"position": {
										'top': "8%",
										'left': '79%'
									}
								});
								ajax_loader.fadeOut();
							}
						});
					} else {
						$.fn.notify({
							"close-button": true,
							"type": "error",
							'text': 'You should insert at least one search term',
							"position": {
								'top': "8%",
								'left': '79%'
							}
						});
					}
					this.first_requestRunning = true;
				}
				button.click(load_data);
				$(document).on('keydown', function(e) {
					var code = (e.keyCode ? e.keyCode : e.which);
					if (code == 13 && $('#search').is(':focus')) {
						load_data();
					}
				});
			}
		};
		search.init(default_options);
	})();

});