

# Manifest

<p>The data, parameters and settings needed to present a chart in ParaCharts. @public</p>

<table>
<tbody>
<tr><th>$id</th><td>https://fizz.studio/schema/manifest.schema.json</td></tr>
<tr><th>$schema</th><td>https://json-schema.org/draft/2020-12/schema</td></tr>
</tbody>
</table>

## Properties

<table class="jssd-properties-table"><thead><tr><th colspan="2">Name</th><th>Type</th></tr></thead><tbody><tr><td colspan="2"><a href="#datasets">datasets</a></td><td>Array</td></tr></tbody></table>



<hr />


## datasets


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The data and parameters needed to present a chart in ParaCharts.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Array</td></tr>
    <tr>
      <th>Required</th>
      <td colspan="2">Yes</td>
    </tr>
    <tr>
      <th>Unique Items</th>
      <td colspan="2">true</td>
    </tr>
  </tbody>
</table>



### datasets.type


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The type of the chart, such as &#x27;line&#x27; or &#x27;column&#x27;.</td>
    </tr>
    
    <tr>
      <th>Enum</th>
      <td colspan="2"><ul><li>line</li><li>stepline</li><li>bar</li><li>column</li><li>lollipop</li><li>histogram</li><li>scatter</li><li>heatmap</li><li>pie</li><li>donut</li></ul></td>
    </tr>
  </tbody>
</table>




### datasets.title


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The title of the chart.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.chartTheme


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">What quantities the line chart displays overall. Defaults to the theme of the single series ONLY in single series charts.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Object</td></tr>
    
  </tbody>
</table>



### datasets.chartTheme.baseQuantity


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The base quantity measured by the series or chart, such as &#x27;item price&#x27; or &#x27;inflation rate&#x27;.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.chartTheme.baseKind


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">What kind of base quantity this is: either a number of things (number), a quantity measured by a unit (dimensioned), a rate of change (rate), or a proportion of a whole (proportion).</td>
    </tr>
    
    <tr>
      <th>Enum</th>
      <td colspan="2"><ul><li>number</li><li>dimensioned</li><li>rate</li><li>proportion</li></ul></td>
    </tr>
  </tbody>
</table>




### datasets.chartTheme.locale


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The particular location that the quantity measured by this series or chart is limited to, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.chartTheme.entity


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The singular, definite entity the quantity measured by this series or chart belongs to, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.chartTheme.items


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The multiple, indefinite items the quantity measured by this series or chart belongs to, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.chartTheme.aggregate


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The statistical aggregate measured by this series or chart, such as &#x27;total&#x27; or &#x27;estimated&#x27;, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>





### datasets.facets


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Metadata describing each facet of the chart which represents some dimension of the data.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Object</td></tr>
    <tr>
      <th>Min Properties</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.series


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Metadata, and possibly inline data, describing the series of the chart.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Array</td></tr>
    <tr>
      <th>Unique Items</th>
      <td colspan="2">true</td>
    </tr>
  </tbody>
</table>



### datasets.series.key


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">A unique identifier for the series, which may have spaces, punctuation, or other non-alphanumeric characters that aren&#x27;t allowed in DOM ids, but which still may not be suitable for the text label.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.series.label


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The text label for the series, which may be abbreviated or expanded from the series key. Defaults to key.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.series.theme


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">What quantity the series measures.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Object</td></tr>
    
  </tbody>
</table>



### datasets.series.theme.baseQuantity


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The base quantity measured by the series or chart, such as &#x27;item price&#x27; or &#x27;inflation rate&#x27;.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.series.theme.baseKind


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">What kind of base quantity this is: either a number of things (number), a quantity measured by a unit (dimensioned), a rate of change (rate), or a proportion of a whole (proportion).</td>
    </tr>
    
    <tr>
      <th>Enum</th>
      <td colspan="2"><ul><li>number</li><li>dimensioned</li><li>rate</li><li>proportion</li></ul></td>
    </tr>
  </tbody>
</table>




### datasets.series.theme.locale


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The particular location that the quantity measured by this series or chart is limited to, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.series.theme.entity


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The singular, definite entity the quantity measured by this series or chart belongs to, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.series.theme.items


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The multiple, indefinite items the quantity measured by this series or chart belongs to, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>




### datasets.series.theme.aggregate


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The statistical aggregate measured by this series or chart, such as &#x27;total&#x27; or &#x27;estimated&#x27;, if any.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">String</td></tr>
    <tr>
      <th>Min Length</th>
      <td colspan="2">1</td>
    </tr>
  </tbody>
</table>





### datasets.series.records


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The datapoints of this series represented inline.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Array</td></tr>
    
  </tbody>
</table>





### datasets.seriesRelations


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">How series are related to each other in multi-series bar family charts. Defaults to &#x27;stacked&#x27;.</td>
    </tr>
    
    <tr>
      <th>Enum</th>
      <td colspan="2"><ul><li>stacked</li><li>grouped</li></ul></td>
    </tr>
  </tbody>
</table>




### datasets.data


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The source for the data for this dataset.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Object</td></tr>
    
  </tbody>
</table>



### datasets.data.source


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Whether the data is inline or sourced externally.</td>
    </tr>
    
    <tr>
      <th>Enum</th>
      <td colspan="2"><ul><li>inline</li><li>external</li></ul></td>
    </tr>
  </tbody>
</table>





### datasets.settings


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The settings needed to present a chart in ParaCharts.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Object</td></tr>
    
  </tbody>
</table>



### datasets.settings.sonification.isEnabled


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">Whether sonification is enabled for this chart. Defaults to true.</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Boolean</td></tr>
    
  </tbody>
</table>




### datasets.settings.aspectRatio


<table class="jssd-property-table">
  <tbody>
    <tr>
      <th>Description</th>
      <td colspan="2">The ratio of the height to the width of the chart on the screen (i.e. x-axis size / y-axis size). Defaults to 1 (i.e. a square chart).</td>
    </tr>
    <tr><th>Type</th><td colspan="2">Number</td></tr>
    
  </tbody>
</table>











<hr />

## Schema
```
{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://fizz.studio/schema/manifest.schema.json",
    "title": "Manifest",
    "description": "The data, parameters and settings needed to present a chart in ParaCharts. @public",
    "type": "object",
    "properties": {
        "datasets": {
            "description": "The data and parameters needed to present a chart in ParaCharts.",
            "type": "array",
            "items": {
                "$ref": "#/$defs/dataset"
            },
            "uniqueItems": true
        }
    },
    "required": [
        "datasets"
    ],
    "additionalProperties": false,
    "$defs": {
        "dataset": {
            "description": "A set of data and parameters needed to present a chart in ParaCharts.",
            "type": "object",
            "properties": {
                "type": {
                    "description": "The type of the chart, such as 'line' or 'column'.",
                    "enum": [
                        "line",
                        "stepline",
                        "bar",
                        "column",
                        "lollipop",
                        "histogram",
                        "scatter",
                        "heatmap",
                        "pie",
                        "donut"
                    ]
                },
                "title": {
                    "description": "The title of the chart.",
                    "$ref": "#/$defs/name"
                },
                "chartTheme": {
                    "description": "What quantities the line chart displays overall. Defaults to the theme of the single series ONLY in single series charts.",
                    "$ref": "#/$defs/theme"
                },
                "facets": {
                    "description": "Metadata describing each facet of the chart which represents some dimension of the data.",
                    "type": "object",
                    "additionalProperties": {
                        "$ref": "#/$defs/facet"
                    },
                    "minProperties": 1
                },
                "series": {
                    "description": "Metadata, and possibly inline data, describing the series of the chart.",
                    "type": "array",
                    "items": {
                        "$ref": "#/$defs/seriesManifest"
                    },
                    "uniqueItems": true
                },
                "seriesRelations": {
                    "description": "How series are related to each other in multi-series bar family charts. Defaults to 'stacked'.",
                    "enum": [
                        "stacked",
                        "grouped"
                    ]
                },
                "data": {
                    "description": "The source for the data for this dataset.",
                    "$ref": "#/$defs/data"
                },
                "settings": {
                    "description": "The settings needed to present a chart in ParaCharts.",
                    "$ref": "#/$defs/settings"
                }
            },
            "required": [
                "type",
                "title",
                "facets",
                "series",
                "data"
            ],
            "additionalProperties": false
        },
        "facet": {
            "description": "Metadata describing a facet of the chart which represents some dimension of the data.",
            "type": "object",
            "properties": {
                "label": {
                    "description": "A text label for the quantity measured by this facet.",
                    "$ref": "#/$defs/name"
                },
                "description": {
                    "description": "An extended text description for the quantity measured by this facet.",
                    "type": "string"
                },
                "variableType": {
                    "description": "Whether the variable this facet measures depends on the variable measured by another facet or facets.",
                    "enum": [
                        "dependent",
                        "independent"
                    ]
                },
                "measure": {
                    "description": "The NOIR data scale of the quantity this facet measures.",
                    "enum": [
                        "nominal",
                        "ordinal",
                        "interval",
                        "ratio"
                    ]
                },
                "datatype": {
                    "description": "The primitive type of the data measured by this facet.",
                    "enum": [
                        "number",
                        "date",
                        "string"
                    ]
                },
                "displayType": {
                    "description": "How this facet should be displayed on the chart",
                    "$ref": "#/$defs/displayType"
                },
                "units": {
                    "description": "The units for the data of this facet, in singular form, if any. This value should be absent if the facet measures a dimensionless quantity. If the units for this facet of the chart are fractional, then this is only the numerator of that fraction.",
                    "$ref": "#/$defs/name"
                },
                "multiplier": {
                    "description": "The number each datum of this facet must be multiplied by to get the true value. Defaults to 1.",
                    "type": "number"
                },
                "denominator": {
                    "description": "If the units for this facet of the chart are fractional, then this is the denominator of that fraction. For example: '(per) capita', '(per) million inhabitants'. If this property is present, then every series on the chart must measure a fractional quantity, of which this will also be the denominator.",
                    "$ref": "#/$defs/name"
                }
            },
            "required": [
                "label",
                "variableType",
                "measure",
                "datatype",
                "displayType"
            ],
            "additionalProperties": false
        },
        "seriesManifest": {
            "description": "Metadata, and possibly inline data, describing a series on the chart.",
            "type": "object",
            "properties": {
                "key": {
                    "description": "A unique identifier for the series, which may have spaces, punctuation, or other non-alphanumeric characters that aren't allowed in DOM ids, but which still may not be suitable for the text label.",
                    "$ref": "#/$defs/seriesName"
                },
                "label": {
                    "description": "The text label for the series, which may be abbreviated or expanded from the series key. Defaults to key.",
                    "$ref": "#/$defs/seriesName"
                },
                "theme": {
                    "description": "What quantity the series measures.",
                    "$ref": "#/$defs/theme"
                },
                "records": {
                    "description": "The datapoints of this series represented inline.",
                    "type": "array",
                    "items": {
                        "$ref": "#/$defs/datapointManifest"
                    }
                }
            },
            "required": [
                "key",
                "theme"
            ],
            "additionalProperties": false
        },
        "theme": {
            "description": "The topic of a series or chart.",
            "type": "object",
            "properties": {
                "baseQuantity": {
                    "description": "The base quantity measured by the series or chart, such as 'item price' or 'inflation rate'.",
                    "$ref": "#/$defs/name"
                },
                "baseKind": {
                    "description": "What kind of base quantity this is: either a number of things (number), a quantity measured by a unit (dimensioned), a rate of change (rate), or a proportion of a whole (proportion).",
                    "enum": [
                        "number",
                        "dimensioned",
                        "rate",
                        "proportion"
                    ]
                },
                "locale": {
                    "description": "The particular location that the quantity measured by this series or chart is limited to, if any.",
                    "type": "string",
                    "$ref": "#/$defs/name"
                },
                "entity": {
                    "description": "The singular, definite entity the quantity measured by this series or chart belongs to, if any.",
                    "type": "string",
                    "$ref": "#/$defs/name"
                },
                "items": {
                    "description": "The multiple, indefinite items the quantity measured by this series or chart belongs to, if any.",
                    "type": "string",
                    "$ref": "#/$defs/name"
                },
                "aggregate": {
                    "description": "The statistical aggregate measured by this series or chart, such as 'total' or 'estimated', if any.",
                    "type": "string",
                    "$ref": "#/$defs/name"
                }
            },
            "required": [
                "baseQuantity",
                "baseKind"
            ],
            "additionalProperties": false
        },
        "datapointManifest": {
            "description": "A datapoint on the graph.",
            "type": "object",
            "additionalProperties": {
                "description": "The value of the point relative to the facet labelled by this property key.",
                "type": "string"
            },
            "minProperties": 1,
            "$comment": "Additional validation: These properties must match those in `facets`."
        },
        "data": {
            "description": "The source for the data of a dataset.",
            "type": "object",
            "properties": {
                "source": {
                    "description": "Whether the data is inline or sourced externally.",
                    "enum": [
                        "inline",
                        "external"
                    ]
                }
            },
            "if": {
                "properties": {
                    "source": {
                        "const": "external"
                    }
                }
            },
            "then": {
                "properties": {
                    "path": {
                        "description": "The location of the external data file.",
                        "type": "string",
                        "$comment": "Additional validation?: check path is a URL or a relative path."
                    },
                    "format": {
                        "description": "The format of the data file.",
                        "type": "string",
                        "$comment": "Additional validation?: check format is a MIME type."
                    }
                },
                "required": [
                    "path",
                    "format"
                ]
            },
            "unevaluatedProperties": false,
            "required": [
                "source"
            ],
            "tsType": "{ source: 'inline' | 'external', path?: string, format?: string }"
        },
        "settings": {
            "description": "The settings needed to present a chart in ParaCharts.",
            "type": "object",
            "properties": {
                "sonification.isEnabled": {
                    "description": "Whether sonification is enabled for this chart. Defaults to true.",
                    "type": "boolean"
                },
                "aspectRatio": {
                    "description": "The ratio of the height to the width of the chart on the screen (i.e. x-axis size / y-axis size). Defaults to 1 (i.e. a square chart).",
                    "type": "number"
                }
            },
            "required": [],
            "additionalProperties": false
        },
        "name": {
            "description": "The name of something, as a non-empty string.",
            "type": "string",
            "minLength": 1
        },
        "seriesName": {
            "description": "The name of a series, as a non-empty string. This is identical to `name`, but specified for semantic reasons",
            "$ref": "#/$defs/name"
        },
        "displayType": {
            "description": "How a facet should be displayed on the graph.",
            "type": "object",
            "properties": {
                "type": {
                    "description": "What type of chart element represents the facet.",
                    "enum": [
                        "axis",
                        "marking",
                        "area",
                        "angle"
                    ]
                },
                "orientation": {
                    "description": "What type of chart element represents the facet.",
                    "enum": [
                        "horizontal",
                        "vertical"
                    ]
                },
                "minDisplayed": {
                    "description": "The lowest value displayed on this axis of the chart. Defaults to zero for the dependent axis and the minimum independent value of any series for the independent axis.",
                    "type": "number"
                },
                "maxDisplayed": {
                    "description": "The highest value label displayed on this axis of the chart. Defaults to the maximum value of any series relative to this axis.",
                    "type": "number"
                }
            },
            "required": [
                "type"
            ],
            "additionalProperties": false,
            "$comment": "Additional validation: The other properties should be only those relevant to the type."
        }
    }
}
```


