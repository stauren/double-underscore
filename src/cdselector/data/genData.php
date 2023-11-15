<?PHP

/**

SELECT CONCAT( 'array(', id, ',"', region_name, '",', parent_id, ',',
  display_order, '),' )
FROM `region_code`
WHERE 1

SELECT CONCAT( 'array(', id, ',"', title, '",', parent_id, ',',
  display_order, '),' )
FROM `category`
WHERE 1

SELECT CONCAT( '<li><a href="/offer/step2?category=', parent_id, '-', id, '">', title, '</a></li>' )
FROM `category`
WHERE 1 
ORDER BY parent_id

 */
/*
$aSourceData = array(
array(1,"家庭服务",0,1),
array(2,"房屋租售",0,2)
);
*/

if (!isset($argv[1]) || !file_exists($argv[1])) {
  exit(1);
}

include($argv[1]); //define $aSourceData

$sData = "";
$aLevels = array();
$aLevelsStr = array();
$aLevelsOrder = array();
foreach($aSourceData as $onedata) {
  $sData .= $onedata[0] .':"'. $onedata[1] . '",'; 
  $parent = $onedata[2];
 
  //build all level array
  if (!isset($aLevelsStr[$parent])) {
    $aLevelsStr[$parent] = array();
    $aLevels[$parent] = array();
  }

  $aLevels[$parent] []= $onedata[0];

  if (isset($aLevelsStr[$parent][$onedata[3]])) {
    $aLevelsStr[$parent][$onedata[3]] .= ','. $onedata[0];
  } else {
    $aLevelsStr[$parent][$onedata[3]] = $onedata[0];
  }
}

foreach ($aLevelsStr as $key => $aOneLevel) {
  //sort the levels by the display_order
  ksort($aOneLevel);
  $aLevelsStr[$key] = implode(',', $aOneLevel);
}

$sData = substr($sData, 0, -1);

//$currentParent = $aLevels[0];
function getLvlStr($parent) {
  global $aLevelsStr, $aLevels;
  //ksort($arr);

  /*add 'no-limit' for cities
  $keys = array_keys($arr);
  if($keys[0] >= 50000) {
    array_unshift($arr, 0);
  }
 //*/ 

  $startStr = $parent .':[';

  /*add 'no-limit' for cities, new
  $inLevel12 = false;
  if ($parent == 0) {
    $inLevel12 = true; //this is a level 1 data
  } else if (in_array($parent, $aLevels[0])) {
    $inLevel12 = true; //this is a level 2 data
  }
  if (!$inLevel12) {
    $startStr = $parent .':[0,';
  }
  //*/ 

  return $startStr . $aLevelsStr[$parent] .']';
}
function getWithChild($data, $arr = array(1),  $iLevel = 0) {
  global $aLevelAry;
  foreach($arr as $item) {
    $nextLevel = $iLevel + 1;
    if (isset($data[$item])) {
      if (!isset($aLevelAry[$nextLevel])) {
       $aLevelAry[$nextLevel] = array();
      }
      $aLevelAry[$nextLevel] []= getLvlStr($item);
      getWithChild($data, $data[$item], $nextLevel);
    }
  }
  if ($iLevel == 0) {
    $aLevelAry[0] = array(getLvlStr(0));
    ksort($aLevelAry);
    $return = '';
    foreach($aLevelAry as $alevel) {
      $return .= '{'. implode(',', $alevel) ."}\n,\n"; 
    }
    $return = substr($return, 0, -2);
    return $return;
  }
}
$aLevelAry = array();
$sLevel = getWithChild($aLevels, $aLevels[0]);
/*$currentLevel = 0;
$sLevel = ;
foreach($aLevels[0] $child) {
  $sLevel .= '{0:[}'
}
foreach($aLevels as $parent => $children) {
  $sData .= $parent .':[';
  foreach($children as $child) {
    $sData .= $child .',';
  }
  $sData = substr($sData, 0, -1);
  $sData .= "],\n";
}
$sData = substr($sData, 0, -2);
$sData .= "}\n";*/

$sOutput=<<<EOF
YAHOO.CN.data.* = {
data : {{$sData}},
level : [
{$sLevel}]
};
EOF;
echo $sOutput;
