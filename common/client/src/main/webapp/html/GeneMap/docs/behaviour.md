# Behaviour

##Contents

These sections are more like a user guide:

- [Visualisation Features](#visualisation-features)
- [Annotation Visibility and Selections](#annotation-visibility-and-selections)
- [User Interaction](#user-interaction)

These sections provide more background information on how the visualisation is done:

- [Color](#color)
- [Layout](#layout)

## Visualisation Features 

- *Chromosome title*: A number, letter, roman numeral etc. identifying the chromosome.

- *Chromosome body*: A rounded rectangle whose length is proportional to size of the chromosome

- *Chromosome length*: The length of the gene in base pairs.

- *Gene bands*: Horizontal lines across the chromosome representing genes.

- *Gene labels*: The name of each gene can optionally be displayed with a line joining it to the corresponding gene band. 
When there are too many labels to fit on screen, groups of labels are replaced by a single label indicating the number of labels.

- *QTLs*: A rectangle is displayed for each QTL with a label where space permits.
 When there are too many QTLs to display on screen, the QTLs are grouped and a the total number of QTLs in the group is displayed.

- *SNPs*: A short horizontal line on the left of the chromosome is displayed for each SNP. Multiple horizontal lines next to each other represent SNPs associated to different traits. The SNP colors are described in the legend below the plot.

## Annotation Visibility and Selections

Gene labels and QTLs are not always displayed.

### Gene labels

For an inividual gene label, visibility can be set to :

- `auto`: Display if there is space. This is default state, these genes appear coloured gray.
- `show`: Always display. Genes marked `show` appear in color.
- `hide`: Never display.

The global gene label visibility settings are:

- *Auto labels* : Display all labels set to `show` and automatically choose some labels set to `auto`.
- *Checked labels*: Display only labels set to `show`.
- *No labels*: Don't display any labels.

Whether or not an individual gene is displayed depends on both its individual visibility and the global visiblity setting.

### QTLs

QTLs can be `checked` or `unchecked`.

The global QTL visibility settings are:

- *All QTLs*: Display all QTLs, grouped if necessary
- *Checked QTLs*: Display only `checked` QTLs, with no grouping
- *No QTLs*: Don't display any QTLs.

### Gene selection

Independent of their visibility, genes can also be `selected`. 
When the network view is launched, the `selected` genes are used to generate the network.

## User Interaction

The following actions are possible:

#### Viewport pan and zoom

When the mouse is not over any feature:

- *Mouse drag* : pan the viewport
- *Mouse scroll* : zoom the viewport. 

As the viewport is zoomed, more gene labels are automatically displayed
 and the QTLs are unclustered to take advantage of the increased space available.
 
Click on a chromsome label to show only that chromosome. Click the label again to show all chromosomes.

#### Genes

- *Left click on gene band*: Toggle visbility between `show` and `hide`.
- *Drag across gene bands*: Set visibility of all included genes to `show`.
- *Left click on gene label*: Select gene for use in network view.
- *Right click on gene or cluster label*: Display popup.


##### Genes Popup
- Click gene name to create oxl file.
- Click `show`, `hide` or `auto` to specify visibility.

#### QTLs

- *Right click on QTL (or QTL group)*: Display popup.

##### QTL Popup
- Click check box to make QTL appear when global view setting is set to *Checked QTLs*.

#### SNPs

- *Right click on SNP*: Display popup.

##### SNP Popup
- Click the link to go to external website with more information about the SNP.


#### Menu buttons

- ![Network view](img/graph.png) *Network view*: Launch network view using currently selected genes
- ![Reset selection](img/reset_selection.png) *Reset selections*: Unselect all genes and set all visibilities to `auto`.
- ![Reset pan and zoom](img/layout_center.png)*Reset pan and zoom*
- ![View full screen](img/fit_to_size.png)*View full screen*: Increase genemap size and overlay on top of any other content.
 Click again or click outside the genemap to restore the original size.
- [Dropdown menu] *Set global gene label visibility*
- [Dropdown menu] *Set number of genes to display*: This affects both gene bands and labels.
- ![Export](img/save.png)*Export view to png*: By default, the image is created with 2x the on-screen resolution.
- ![Advanced](img/gearwheel.png)*Advanced options*
Under Advanced options you can
- [Dropdown menu] *Set global QTL visibility* 
- Set number of chromosomes per row
- Filter SNPs based on p-value threshold (default 0.00001)
- Set gene and QTL label size
- Export entire map


## Color

For automatically displayed genes, importance is mapped to opacity in the range 0.5 - 1.0 by the relation:

    opacity =  0.5 * ( 1 +  importance - minimum_importance ) / ( maximum_importance - minimum_importance ) )
 
If importance values are not available but the genes are ranked by importance, the opacity is generated by:

    opacity =  max_opacity - 0.5 +  1 / (1 + pow( rank, opacity_falloff) ) 
        
where `max_opacity = 0.9`, `opacity_falloff = 3.5`.
 This function falls off sharply initially so that the first few genes are clearly distinguished, then it tends to 0.5.

For genes which have been set to `show`, the label color is taken directly from the source data.
The colours are green, orange and red for the top, middle and bottom thirds of the genes ranked by importance.

## Layout

### Length scales

Various length scales are relevant when positioning elements:

##### Available canvas size
Given a fixed canvas size, the number of chromosomes per row determines the number rows required 
and hence the width and height available to each chromosome.

##### Chromosome width
The chromosome width is chosen to ensure a fixed aspect ratio for the longest chromosome.
Other dimensions such as the width of the QTL regions are calculated as a fraction of the chromosome width.

##### Absolute pixel size
In most cases, text is displayed at a fixed fontsize.
If there is not enough space for the text, it is simply not shown.
Lines such as the chromosome border and the lines connecting labels to genes
 are also displayed with a fixed width in pixels.

### Gene Annotations

##### Decide which labels to show

Genes which have been set to `show` are always shown.
If there is enough space horizontally to fit genes labels between two chromosomes,
then some of the genes set to `auto` can be displayed.
The number of `auto` genes is determined by the available vertical space.

When a previously undisplayed gene is set to `show`,
this reduces the amount of space available for the `auto` genes.
However it would create a confusing UI experience if clicking on a gene band display a gene 
also resulted in an `auto` gene disappearing.
Instead, the number of `auto` genes to display is calculated independently of any genes set to `show`, 
so the additional `show` genes force the labels to take up more than 1 column.
   
##### Generate positions
The [labella library](http://twitter.github.io/labella.js/) is used to generate positions for the labels.
It distributes the labels into as many columns as necessary 
and then uses [Variable Placement with Separation Constraints](https://github.com/tgdwyer/WebCola/wiki/What-is-VPSC%3F)
to place labels as close as possible to the genes they refer to.
The labella library also generates the required paths to connect genes to labels.

##### Cluster if necessary (k-means)
When there are a large number of labels to display, the result is sometimes a large number of columns, 
resulting in an ugly overlap with neighbouring chromosomes.
In this case, the gene labels can be clustered and shown as groups 
(where information about individual genes within a cluster can be seen by right clicking the cluster).
The labels are clustered using the ckmeans algorithm
(implemented in the [simplestatistics package](http://simplestatistics.org/docs/#ckmeans),
which aims to minimise the within-group sum-of-squared-deviations.
 
 It would be possible to ensure that no ugly overlaps ever occurred 
 by comparing the number of columns produced by labella with the available horizontal space.
 However, this would create a confusing UI experience where setting one more label to `show` 
 could result in re-clustering of all labels.
 In order to minimise user frustration, some ugly overlapping is allowed before clustering is introduced.
 In any case, zooming in usually fixes any layout problems because
 there will eventually be enough space to display all labels in one column.
 
 After any clustering has been applied, the label positions are recalculated using labella again.

##### Draw (with animation)
Once the label positions have been calculated, they are drawn to screen using the [d3](d3js.org) library
for data driven DOM manipulation.
When a user zooms in, the positions of labels can change and new labels can appear. 
In principle a new label could appear at the old location of an existing label,
 which would make it difficult to keep track of which is which.
To mitigate this, changes in label position are animated, so that the user can keep track of how a label has moved.

### QTL Annotations

####Automatic case:

##### Cluster all QTLs (hierarchical)
There is no ranking applied to QTLs, so, in the automatic case, 
all QTLs are displayed but they clustered so that nearby QTLs appear as a single group.

The groups are formed by agglomerative hierarchical clustering in which each QTL starts in its own cluster,
and pairs of similar clusters are repeatedly merged according to
a *metric* which determines what makes two QTLs similar
and a *linkage criterion* which specificies how the metric should be applied to a cluster of QTLs.

For clustering QTLs, the *single* linkage criterion is used for comparing two clusters.
This means that the *minimum* distance between any two QTLs in the two clusters 
is taken as the distance between the clusters.

The distance metric is designed so that 
clusters which overlap and have similar lengths are preferentially clustered
The metric is:

    distance = max( 0.1, length_difference - overlap)
    

##### Uncluster as many levels as possible

For a particular zoom level the QTLs are unclustered (reversing the agglomerative process)
as much as possible provided the resulting number of clusters shown does not result in too many lanes (see below).

##### Lay out QTLs in lanes

The QTL clusters are positioned by grouping them into lanes
 such that no two clusters in the same lane overlap.

##### Label QTLs

Once the QTL clusters have been laid out, 
the clusters which contain only a single QTL can be annotated with the label for that QTL.
If the labels take up more space than the QTL itself then the labels may overlap (even though the QTLs didn't).
In this case, only first label in a lane is drawn.

##### Draw (with animation)

As for the gene labels, the appearance and disappearance of QTL clusters
as the zoom level changes can be hard to follow.
Again animation can be used to mitigate this.
When a cluster is split in two, the new clusters are shown to appear at the location of the original cluster before 
moving to their new locations.

### Manual case:

When the global view setting for QTLs is set to display only checked QTLs, no clustering is applied.
Every QTL is displayed individually with it's label.
The QTLs are grouped into lanes as before to avoid overlaps,
but this time the label dimensions are included in the calculation.

### Zoom behaviour

We expect some features to increase in size as we zoom in. 
For example, if the chromosome body has been scaled up by a factor of 2, 
the length of a QTL must obviously also increase by a factor of 2 in order to appear in the right place.
The scaling relation is:

    displayed-size = original-size * zoom-scale

On the other hand, elements like text, typically remain the same absolute size in pixels in order to remain legible, 
so their size relative to the chromosome body changes.
This is advantageous because it means that when there are lots of genes close together,
 we can fit in more labels by zooming in.
The scaling relation is:
 
    displayed-size = original-size
    
Some lengths don't exactly fall into either of these categories. 
For example, the width of a QTL does not convey any information (unlike the length) so, like text,
 it doesn't have to change size to match the size of other elements which have been rescaled.
On the other hand, if the width of the QTL did not change at all during zooming,
its aspect ratio would change significantly (because the length must change) and this feels unnatural.
A satisfactory compromise is to scale the QTL width proportional to a fractional power of the zoom-scale, e.g:

    displayed-size = original-size * zoom-scale^0.4
    
For some text elements, legibility is not the only factor in determining the size.
For example, the chromosome titles would look unnaturally small 
if they remained the same size while the chromosome grew.
The chromosome title size is set to:

    displayed-size = max( 14px, chromosome-displayed-width)

so that when zoomed out, the title is still legible and when zoomed in, the title grows with the chromosome.

#### Implementation note

Panning and zooming is achieved by applying a transform to the svg element.
This means that all elements get automatically scaled when the user zooms in,
so in order to display an element at fixed on-screen size, 
the element size in the code must be divided by the current zoom-scale.
In other words, the values written in the code appear to be divided by `zoom-scale` 
with respect to the values described above.
