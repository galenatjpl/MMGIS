//The bottom left text that describes to the user the basic mmgis state
import $ from 'jquery'
import * as d3 from 'd3'
import F_ from '../Basics/Formulae_/Formulae_'
import Dropy from '../../external/Dropy/dropy'

import tippy from 'tippy.js'

const Description = {
    inited: false,
    waitingOnUpdate: false,
    descCont: null,
    descMission: null,
    descPoint: null,
    tippyDesc: null,
    L_: null,
    _infoAlreadyGone: false,
    init: function (mission, site, Map_, L_) {
        this.L_ = L_
        this.Map_ = Map_
        this.descCont = d3.select('.mainDescription')
        this.descInfoCont = d3.select('.mainInfo')
        /*
            this.descMission = descCont
                .append('div')
                .attr('id', 'mainDescMission')
                .style('line-height', '32px')
                .style('padding-left', '8px')
                .style('color', '#EEE')
                .style('font-size', '22px')
                .style('margin', '0')
                .style('cursor', 'default')
                .style('text-align', 'center')
                .style('cursor', 'pointer')
                .html(mission)
            var missionWidth = $('#mainDescMission').width() + 3
            */

        this.descPoint = this.descCont.append('p').attr('id', 'mainDescPoint')

        this.descPointInner = this.descPoint
            .append('div')
            .attr('id', 'mainDescPointInner')
            .attr('tabindex', 300)
            .style('display', 'flex')
            .style('white-space', 'nowrap')
            .style('line-height', '29px')
            .style('color', 'var(--color-mw2)')
            .style('font-weight', 'bold')
            .style('cursor', 'pointer')
            .style('margin', '0')
        this.descPointLinks = this.descPoint
            .append('div')
            .attr('id', 'mainDescPointLinks')
            .style('display', 'flex')
            .style('white-space', 'nowrap')
            .style('line-height', '29px')
            .style('font-size', '14px')
            .style('color', '#AAA')
            .style('font-weight', 'bold')
            .style('cursor', 'pointer')
            .style('margin', '0')
            .style('overflow', 'hidden')

        Description.descPointInner.on('click', function () {
            if (typeof Map_.activeLayer.getBounds === 'function')
                Map_.map.fitBounds(Map_.activeLayer.getBounds())
            else if (Map_.activeLayer._latlng)
                Map_.map.panTo(Map_.activeLayer._latlng)
        })

        this.inited = true
        if (this.waitingOnUpdate) this.updateInfo()

        $(window).on('resize', () => {
            $('#mainDescPointLinks > dl.dropy').removeClass('open')
            $(`#mainDescPointLinks_global`).empty()
        })
    },
    updateInfo(force) {
        if (force !== true) {
            this.waitingOnUpdate = false
            if (!this.inited) {
                this.waitingOnUpdate = true
                return
            }
        }

        this.descInfoCont.html('')

        let infos = []

        for (let layer in this.L_.layers.data) {
            let l = this.L_.layers.data[layer]
            if (
                this.L_.layers.on[layer] === true &&
                this.L_.layers.layer[layer] &&
                l.hasOwnProperty('variables') &&
                l.variables.hasOwnProperty('info') &&
                l.variables.info.hasOwnProperty('length')
            ) {
                let layers = this.L_.layers.layer[layer]._layers
                let newInfo = ''
                for (let i = 0; i < l.variables.info.length; i++) {
                    let which =
                        l.variables.info[i].which != null &&
                        !isNaN(l.variables.info[i].which)
                            ? Math.max(
                                  Math.min(
                                      which,
                                      Object.keys(layers).length - 1
                                  ),
                                  0
                              )
                            : Object.keys(layers).length - 1
                    let feature = layers[Object.keys(layers)[which]]?.feature
                    if (feature == null) continue

                    let infoText = F_.bracketReplace(
                        l.variables.info[i].value,
                        feature.properties
                    )
                    let lat = !isNaN(feature.geometry.coordinates[1])
                        ? feature.geometry.coordinates[1]
                        : null
                    let lng = !isNaN(feature.geometry.coordinates[0])
                        ? feature.geometry.coordinates[0]
                        : null

                    newInfo +=
                        '<div lat="' +
                        lat +
                        '" lng="' +
                        lng +
                        '" tabindex="' +
                        (301 + i) +
                        '">'
                    if (l.variables.info[i].icon)
                        newInfo +=
                            "<i class='mdi mdi-" +
                            l.variables.info[i].icon +
                            " mdi-18px'></i>"
                    newInfo += '<div>' + infoText + '</div></div>'

                    // Go initially
                    if (Description._infoAlreadyGone == false) {
                        if (l.variables.info[i].go == true) {
                            if (lat != null && lng != null) {
                                Description.Map_.map.setView(
                                    [lat, lng],
                                    Description.Map_.mapScaleZoom ||
                                        Description.Map_.map.getZoom()
                                )
                            }
                            Description._infoAlreadyGone = true
                        }
                    }
                }
                if (newInfo.length > 0) infos.push(newInfo)
            }
        }
        this.descInfoCont.html(infos.join('\n'))

        this.descInfoCont.style('display', 'flex')
        $('.mainInfo').animate(
            {
                opacity: 1,
            },
            80
        )

        d3.select('.mainInfo > div').on('click', function () {
            let lat = d3.select(this).attr('lat')
            let lng = d3.select(this).attr('lng')

            if (lat != null && lng != null) {
                Description.Map_.map.setView(
                    [lat, lng],
                    Description.Map_.mapScaleZoom ||
                        Description.Map_.map.getZoom()
                )
            }
        })
        Description._infoAlreadyGone = true
    },
    updatePoint: function (activeLayer) {
        if (
            activeLayer == null ||
            Description.L_.layers.data[activeLayer.options.layerName] == null
        )
            return

        this.descCont.style('display', 'flex')
        $('.mainDescription').animate(
            {
                opacity: 1,
            },
            80
        )
        if (
            activeLayer != null &&
            activeLayer.feature &&
            activeLayer.hasOwnProperty('options')
        ) {
            var keyAsName
            const links = []

            if (
                this.L_.layers.data[activeLayer.options.layerName] &&
                this.L_.layers.data[activeLayer.options.layerName].variables
            ) {
                let v =
                    this.L_.layers.data[activeLayer.options.layerName].variables

                if (v.links) {
                    for (let i = 0; i < v.links.length; i++) {
                        const link = F_.bracketReplace(
                            v.links[i].link,
                            activeLayer.feature.properties,
                            v.links[i].replace
                        )
                        if (link != null && link != '')
                            links.push({
                                name: `<span style='display: flex; justify-content: space-between;'>${v.links[i].name}<i class='mdi mdi-open-in-new mdi-14px' style='margin-left: 4px; margin-top: 1px;'></i></span>`,
                                link: link,
                                target: F_.cleanString(v.links[i].name),
                            })
                    }
                }
            }

            let key = activeLayer.useKeyAsName || 'name'

            if (
                !(
                    typeof activeLayer.feature.properties[key] === 'string' ||
                    typeof activeLayer.feature.properties[key] === 'number'
                )
            ) {
                const propKeys = Object.keys(activeLayer.feature.properties)
                for (let i = 0; i < propKeys.length; i++) {
                    if (
                        typeof activeLayer.feature.properties[propKeys[i]] ===
                            'string' ||
                        typeof activeLayer.feature.properties[propKeys[i]] ===
                            'number'
                    ) {
                        key = propKeys[i]
                        break
                    }
                }
            }

            keyAsName =
                ` <div style="max-width: 180px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${activeLayer.feature.properties[key]}</div>` +
                ' <div class="mainDescPointInnerType" style="font-size: 11px; padding: 0px 3px; opacity: 0.8;">(' +
                key +
                ')</div>'

            Description.descPointInner.html(
                Description.L_.layers.data[activeLayer.options.layerName]
                    .display_name +
                    ': ' +
                    keyAsName
            )

            $('#mainDescPointLinks_global').remove()
            const globalConstruct = Dropy.construct(
                links.map((l) => l.name),
                `<i class='mdi mdi-link mdi-18px'></i>`,
                null,
                {
                    openUp: false,
                    dark: true,
                }
            )
            $('#mainDescPointLinks').html(globalConstruct)
            Dropy.init(
                $('#mainDescPointLinks'),
                function (idx) {
                    if (links[idx] && links[idx].link)
                        window.open(
                            links[idx].link,
                            links[idx].target || '_blank'
                        )
                },
                null,
                null,
                { dontChange: true, globalConstruct }
            )

            if (Description.tippyDesc && Description.tippyDesc[0])
                Description.tippyDesc[0].setContent(
                    activeLayer.feature.properties[key]
                )
            else
                Description.tippyDesc = tippy('#mainDescPointInner', {
                    content: activeLayer.feature.properties[key],
                    placement: 'bottom',
                    theme: 'blue',
                })
        }
    },
    clearDescription: function () {
        // Clear the description
        $('#mainDescPointInner').empty()
        $('#mainDescPointLinks').empty()

        // Reset the style
        this.descCont.attr('style', null)
    },
}

export default Description
