(function($){
	$(document).ready(function(){
		d3.select(window).on("resize", throttle);

		var zoom = d3.behavior.zoom()
		    .scaleExtent([1, 8])
		    .on("zoom", move);

		var width = document.getElementById('map-container').offsetWidth-60;
		var height = width / 2;

		var topo,projection,path,svg,g;

		setup(width,height);

		function setup(width,height){
		  projection = d3.geo.mercator()
		    .translate([0, 0])
		    .scale(width / 2 / Math.PI);

		  path = d3.geo.path()
		      .projection(projection);

		  svg = d3.select("#map-container").append("svg")
		      .attr("width", width)
		      .attr("height", height)
		      .append("g")
		      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
		      .call(zoom);

		  g = svg.append("g");

		}

		// via localized variable
		d3.json(failedStates2016.assetsDirUri + '/world.json', function(error, world) {

			//Redrawing the markers to get rid of the default white fill

			dimple._drawMarkers = function (lineDataRow, chart, series, duration, className, useGradient, enterEventHandler, leaveEventHandler, lineShape) {
			var markers,
					markerClasses = ["dimple-marker", className, lineDataRow.keyString],
					rem,
					shapes;

			if (series._markers === null || series._markers === undefined || series._markers[lineDataRow.keyString] === undefined) {
					markers = series._group.selectAll("." + markerClasses.join(".")).data(lineDataRow.markerData);
			} else {
					markers = series._markers[lineDataRow.keyString].data(lineDataRow.markerData, function (d) {
							return d.key;
					});
			}
			// Add
			if (lineShape.nextSibling && lineShape.nextSibling.id) {
					shapes = markers.enter().insert("circle", '#' + lineShape.nextSibling.id);
			} else {
					shapes = markers.enter().append("circle");
			}
			shapes
				.attr("id", function (d) {
						return dimple._createClass([d.key + " Marker"]);
				})
				.attr("class", function (d) {
					var fields = [],
							css = chart.getClass(d.aggField.length > 0 ? d.aggField[d.aggField.length - 1] : "All");
					if (series.x._hasCategories()) {
							fields = fields.concat(d.xField);
					}
					if (series.y._hasCategories()) {
							fields = fields.concat(d.yField);
					}
					return dimple._createClass(fields) + " " + markerClasses.join(" ") + " " + chart.customClassList.lineMarker + " " + css;
				})
				.on("mouseover", function (e) {
					enterEventHandler(e, this, chart, series);
				})
				.on("mouseleave", function (e) {
					leaveEventHandler(e, this, chart, series);
				})
				.attr("cx", function (d) {
					return (series.x._hasCategories() ? dimple._helpers.cx(d, chart, series) : series.x._previousOrigin);
				})
				.attr("cy", function (d) {
					return (series.y._hasCategories() ? dimple._helpers.cy(d, chart, series) : series.y._previousOrigin);
				})
				.attr("r", 0)
				.attr("opacity", (series.lineMarkers || lineDataRow.data.length < 2 ? lineDataRow.color.opacity : 0))
				.call(function () {
					if (!chart.noFormats) {
						this.attr("fill", function (d) {
							return (useGradient ? dimple._helpers.fill(d, chart, series) : lineDataRow.color.fill);
					})
						.style("stroke-width", series.lineWeight)
						.attr("stroke", function (d) {
								return (useGradient ? dimple._helpers.fill(d, chart, series) : lineDataRow.color.stroke);
						});
					}
				});

				// Update
				chart._handleTransition(markers, duration, chart)
					.attr("cx", function (d) { return dimple._helpers.cx(d, chart, series); })
					.attr("cy", function (d) { return dimple._helpers.cy(d, chart, series); })
					.attr("r", 2 + series.lineWeight)
					.attr("opacity", (series.lineMarkers || lineDataRow.data.length < 2 ? lineDataRow.color.opacity : 0))
					.call(function () {
						if (!chart.noFormats) {
							this.attr("fill", function (d) {
								return (useGradient ? dimple._helpers.fill(d, chart, series) : lineDataRow.color.fill);
									})
							.style("stroke-width", "0")
						}
					});

					// Remove
					rem = chart._handleTransition(markers.exit(), duration, chart)
							.attr("cx", function (d) { return (series.x._hasCategories() ? dimple._helpers.cx(d, chart, series) : series.x._origin); })
							.attr("cy", function (d) { return (series.y._hasCategories() ? dimple._helpers.cy(d, chart, series) : series.y._origin); })
							.attr("r", 0);

					// Run after transition methods
					if (duration === 0) {
							rem.remove();
					} else {
							rem.each("end", function () {
									d3.select(this).remove();
							});
					}

					if (series._markers === undefined || series._markers === null) {
							series._markers = {};
					}
					series._markers[lineDataRow.keyString] = markers;

					// Insert the backings before the markers
					dimple._drawMarkerBacks(lineDataRow, chart, series, duration, className, lineShape);

			};

				var countries = topojson.feature(world, world.objects.countries).features;

		  	topo = countries;
		  	draw(topo);

			countries.sort(function(a,b){
				if(parseFloat(a.properties.Total) && parseFloat(b.properties.Total)) {
					return (parseFloat(a.properties.Total) > parseFloat(b.properties.Total)) ? -1 : 1;
				}
			});

			$('#dataTable').append('<thead><tr><td class="rank">Rank</td><td class="name">Name</td><td class="Total">Total</td><td class="DemographicPressures">Demogr. Press.</td><td class="RefugeesandIDPs">Refugees and IDPS</td><td class="GroupGrievance">Group Grievance</td><td class="HumanFlight">Human Flight</td><td class="UnevenDevelopment">Uneven Dev.</td><td class="PovertyandEconomicDecline">Poverty &<br> Econ. Decline</td><td class="LegitimacyoftheState">Legit. Of the State</td><td class="PublicServices">Public Services</td><td class="HumanRights">Human Rights</td><td class="SecurityApparatus">Security Apparatus</td><td class="FactionalizedElites">Faction. Elites</td><td class="ExternalIntervention">External Intervention</td><td class="Year06" >2006</td><td class="Year11" >2011</td><td class="Year16" >2016</td><td class="TenYearChange" >10-Yr Change</td><td class="flag_img" >Flag Img</td></tr></thead>');

			countries.forEach(function(d,i){

				if(undefined !== d.properties.rank){
					//Avoid dupes here due to dataset mapping between FFP and FP

					d.properties.name.replace(/\W+/g, ""); //remove errant characters


					if($('li[data-country="'+d.properties.name+'"]').length == 0){
						$('<li/>',{
							text: d.properties.rank+' '+d.properties.name,
							'data-country': d.properties.name
						}).appendTo('#countryList');
					}


					if($('tr[data-country="'+d.properties.name +'"]').length == 0){

						$('<tr/>',{
							'data-country': d.properties.name
						}).appendTo('#dataTable');

						$('<td/>',{
							'class': 'rank',
							text: d.properties.rank
						}).appendTo('tr[data-country="'+d.properties.name+'"]');

						$.each(d.properties, function(key, val){
							if( key !== 'color' && key !== 'rank'){
								var classkey = key.replace(/\s+/g, '');
								$('<td/>',{
									'class': classkey,
									text: val
								}).appendTo('tr[data-country="'+d.properties.name+'"]');
							}
						});
					}
				}
			});

			$('#FP__country-name__input').autocomplete({
				appendTo: '#countryName',
				minLength: 2,
				select: function(event, ui) {
					event.preventDefault();
					var index = ui.item.value;
					onCountryClick(countries[index], index);
				},
				source: $.map(countries, function(country, index) {
					if(country.properties.rank) {
					return {
						value: index,
						label: country.properties.name
					};}
				})
			});


			$('#dataTable').tablesorter({
				sortList: [[0,0]]
			});


			//For the breakdown bar chart

			var categories = ['Demographic<br>Pressures','Refugees<br>and&nbsp;IDPS','Group<br>Grievance','Human<br>Flight','Uneven<br>Development','Poverty And<br>Economic Decline','Legitimacy Of<br>the State','Public<br>Services','Human<br>Rights','Security<br>Apparatus','Factionalized<br>Elites','External<br>Intervention'];
			var categoryIndex = 0;

			$(categories).each(function(){

				var barContainer = $('<div class="barContainer"></div>');
				barContainer.append('<div class="barGraph"><div class="bar"></div></div><div class="barScore"></div><div class="barLabel">'+this+'<span class="barIcon cat_'+categoryIndex+'"></span></div>');
				$('#countryBreakdown').append(barContainer);
				categoryIndex++;
			});

			var tableHr = $('tr');

			//Load the table with only the first ten rows

			$wpjQ('.fsi-table tr:gt(10)').hide();

		});


		//DIMPLEJS LINE CHART

		var clearTenYearChart = (function() {
		})();

		var tenYearChart = (function() {
			var chartContainerSelector = '#FP__chart__ten-year';
			var chartContainer = $(chartContainerSelector);

			return {
				clear: function() {
					chartContainer.empty();
				},

				draw: function(data) {
					var svg = dimple.newSvg(chartContainerSelector, '100%', 170);
					var chart = new dimple.chart(svg, data);

					var x = chart.addCategoryAxis('x', 'Year');
					var y = chart.addMeasureAxis('y', 'Score');

					x.fontFamily = "Solido";
					x.fontSize = '0.9em';
					x.title = null;
					x.showGridlines = true;

					y.showGridlines = false;
					y.fontFamily = "Solido";
					y.fontSize = '0.8em';

					var lines = chart.addSeries(null, dimple.plot.line);
					chart.defaultColors = [
						new
						dimple.color("#dcdcdc")
					];

					lines.lineWeight = 5;
					lines.lineMarkers = true;


					//Redrawing the tooltips to display only Y-axis data

					lines.getTooltipText = function (e) {
						var rows = [];
						// Add the series categories
						if (this.categoryFields !== null && this.categoryFields !== undefined && this.categoryFields.length > 0) {
								this.categoryFields.forEach(function (c, i) {
										if (c !== null && c !== undefined && e.aggField[i] !== null && e.aggField[i] !== undefined) {
												// If the category name and value match don't display the category name
												rows.push(c + (e.aggField[i] !== c ? ": " + e.aggField[i] : ""));
										}
								}, this);
						}


						if (!this.p) {

								if (this.y) {
										this.y._getTooltipText(rows, e);
								}

						}
						return rows;
				};

					chart.draw();

				//Changes colors of line chart markers based on value
					svg.selectAll('.dimple-marker,.dimple-marker-back')
						.style('fill', function(data){
							var Score = data.cy;
							if((Score >= 0) && (Score < 24)) {
								return '#ffb3b3';
							}
							else if ((Score >= 24) && (Score < 36)) {
								return '#ff6666';
							}
							else if ((Score >= 36) && (Score < 48)) {
								return '#ff3333';
							}
							else if ((Score >= 48) && (Score < 60)) {
								return '#ff0000';
							}
							else if ((Score >= 60) && (Score < 72)) {
								return '#CC0000';
							}
							else if ((Score >= 72) && (Score < 84)) {
								return '#990000';
							}
							else if ((Score >= 84) && (Score < 96)) {
								return '#800000';
							}
							else if ((Score >= 96) && (Score < 108)) {
								return '#660000';
							}
							else if (Score >= 108) {
								return '#330000';
							}
						});

			//Styling adjustments for line chart
					y.tickFormat = ".1f";
					svg.selectAll(".dimple-marker,.dimple-marker-back").attr("r", "10");
					svg.select(".dimple-axis-x").attr("stroke-width","0");
					svg.select(".dimple-axis-y").attr("stroke-width","0");
					svg.selectAll(".dimple-custom-axis-label").attr("dy",".61em");

				}
			};
		})();



		//~ Click interaction handling; old comments were maintained
		//
		function onCountryClick(data, _index) {
			if (undefined === data.properties.rank) {
				return;
			}

			$('#FP__country-name__input').val(data.properties.name);
			$('#countryRank .value').text(data.properties.rank);
			$('#countryScore .value').text(data.properties.Total);

			//Adds the flag icons, styles them and gets rid of them when you type in a new country
			var flagImg = 'https://foreignpolicymag.files.wordpress.com/2016/06/fs16-country-'+data.properties.flag_img+'.png';
      $('#FP__country-name__input').css('background-image', 'url(' + flagImg + ')');
      $('#FP__country-name__input').css('background-repeat', 'no-repeat');
     	$('#FP__country-name__input').css('background-position', 'right top');
			$('#FP__country-name__input').css('background-size', '54px 29px');
			$('#FP__country-name__input').css('border', '1');
			$('#FP__country-name__input').keypress(function (e) {
      	$('#FP__country-name__input').css('background-image', 'none');
     	});

			//Drawing the bar charts

			var metricsWithoutBarCharts = [
				'name',
				'rank',
				'Total',
				'color',
				'10-Year Change'
			];
			var yearsWithTenYearBarCharts = [
			 	'six',
			 	'eleven',
			 	'sixteen'
			]

			var counter = 0;
		 	var tenYearCounter = 0;

			tenYearChart.clear();
			tenYearChart.draw([
				{Year: 2006, Score: data.properties.six},
				{Year: 2011, Score: data.properties.eleven},
				{Year: 2016, Score: data.properties.sixteen}

			]);


			$.each(data.properties, function(key, value) {

					if ($.inArray(key, metricsWithoutBarCharts) > -1) {
						return;
					}

					$('.barContainer:eq(' + counter + ') .barGraph .bar').animate({height: (value * 26)});

					if ((data.properties.Total >= 0) && (data.properties.Total < 24)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#ffb3b3' });
					}
					else if ((data.properties.Total >= 24) && (data.properties.Total < 36)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#ff6666' });
					}
					else if ((data.properties.Total >= 36) && (data.properties.Total < 48)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#ff3333' });
					}
					else if ((data.properties.Total >= 48) && (data.properties.Total < 60)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#FF0000' });
					}
					else if ((data.properties.Total >= 60) && (data.properties.Total < 72)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#CC0000' });
					}
					else if ((data.properties.Total >= 72) && (data.properties.Total < 84)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#990000' });
					}
					else if ((data.properties.Total >= 84) && (data.properties.Total < 96)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#800000' });
					}
					else if ((data.properties.Total >= 96) && (data.properties.Total < 108)) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#660000' });
					}
					else if (data.properties.Total >= 108) {
						$('.barContainer:eq(' + counter + ') .barGraph .bar').css({ 'background' : '#330000' });
					}

					$('.barContainer:eq(' + counter + ') .barScore').text(value);


					counter++;

			});
		}


		function draw(topo) {

			var country = g.selectAll(".country").data(topo);
			var colors = d3.scale.threshold().domain([24,36,48,60,72,84,96,108]).range(['ff9999','ff6666','ff3333','ff0000','cc0000','990000','800000','660000','330000']);

			country.enter().insert("path")
			    .attr("class", "country")
			    .attr("d", path)
			    .attr("id", function(d,i) { return d.id; })
			    .attr("title", function(d,i) { return d.properties.name; })
			    .style("fill", function(d, i) {
					if(d.properties.Total){
						return '#'+colors(d.properties.Total);
					} else {
						return '#ccc';
					}
				});

			country.on('click', onCountryClick);
		}

		/*For the 2015 table*/

			$wpjQ('#expandList').html('Show All Rankings');

			$wpjQ(document).ready(function() {

			$wpjQ('#expandList').toggle(
					function() {
							$wpjQ('.fsi-table tr:gt(10)').slideDown('fast').show();
							$wpjQ(this).html('Show top 10 rankings');
					},
					function() {
							$wpjQ('.fsi-table tr:gt(10)').slideDown('fast').hide();
							$wpjQ(this).html('Show All Rankings');
					});

		});

		/*End 2015 table*/

		function redraw() {
			width =	document.getElementById('map-container').offsetWidth-60;
		  height = width / 2;
		  d3.select('svg').remove();
		  setup(width,height);
		  draw(topo);
		}

		function move() {

		  var t = d3.event.translate;
		  var s = d3.event.scale;
		  var h = height / 3;

		  t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
		  t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

		  zoom.translate(t);
		  g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

		}

		var throttleTimer;
		function throttle() {
		  window.clearTimeout(throttleTimer);
		    throttleTimer = window.setTimeout(function() {
		      redraw();
		    }, 200);
		}


	});

})(jQuery);
