var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'green',
    progressColor: 'blue',
    normalize: true,
    height: 256
});

var regions = Array();

function add_region(start, end) {

    var reg = wavesurfer.addRegion({
        start: start, // time in seconds
        end: end, // time in seconds
        color: 'rgba(255, 0, 0, 0.5)'
    });

    reg.on('dblclick', function () {
        reg.remove();
        var idx = regions.indexOf(reg);
        regions.splice(idx, 1);
    });

    reg.on('in', function () {
        wavesurfer.play(reg.end);
    });

    regions.push(reg);
}


function save_regions(corp_name, item_id) {

    regs = Array();
    rege = Array();

    for (var i = 0; i < regions.length; i++) {
        regs.push(regions[i].start);
        rege.push(regions[i].end);
    }

    console.log(regs);

    $.post('/speech/' + corp_name + '/regions', {
        id: item_id,
        reg_start: regs,
        reg_end: rege
    });
}

function diff_norm() {

    $('#diff_btn').text('Edit');
    $('#diff_btn').off('click');
    $('#diff_btn').click(function () {
        edit_norm();
    });

    var orig = $('#orig').text();
    var corr = $('#corr').val();

    if (!orig || !corr) return;

    var diff = JsDiff.diffChars(orig, corr);

    orig = '';
    corr = '';
    for (i = 0; i < diff.length; i++) {
        if (diff[i].added) {
            corr += '<d>' + diff[i].value + '</d>';
        } else if (diff[i].removed) {
            orig += '<d>' + diff[i].value + '</d>';
        } else {
            corr += diff[i].value;
            orig += diff[i].value;
        }
    }

    $('#orig_diff').html(orig);
    $('#corr_diff').html(corr);

    $('#orig').toggleClass('hide', true);
    $('#corr').toggleClass('hide', true);
    $('#orig_diff').toggleClass('hide', false);
    $('#corr_diff').toggleClass('hide', false);
}

function edit_norm() {
    $('#diff_btn').text('Diff');
    $('#diff_btn').off('click');
    $('#diff_btn').click(function () {
        diff_norm();
    });

    $('#orig').toggleClass('hide', false);
    $('#corr').toggleClass('hide', false);
    $('#orig_diff').toggleClass('hide', true);
    $('#corr_diff').toggleClass('hide', true);
}

function save_speech(corp_name, item_id) {
    var value = $('#corr').val();
    $.post('/speech/' + corp_name + '/modify', {
        id: item_id,
        value: value
    });
    $('#save_btn').toggleClass('btn-success', false);
}

function update_speech() {
    $('#save_btn').toggleClass('btn-success', true);
    $('#corr').toggleClass('modified', true);
}