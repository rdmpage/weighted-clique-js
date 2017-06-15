# Weighted clique

Javascript port of [C++ program to implement Dror G. Feitelson's weighted clique algorithm](https://github.com/rdmpage/weighted-clique)


## Overview
This is a program to implement Dror G. Feitelson's weighted clique algorithm described in [On identifying name equivalences in digital libraries](http://informationr.net/ir/9-4/paper192.html) Information Research, 9(4) paper 192. For more details see [Equivalent author names](http://iphylo.blogspot.co.uk/2009/01/equivalent-author-names.html).



## Example


![Example](https://github.com/rdmpage/weighted-clique/raw/master/examples/abc.png)


```
A B C
Abe Bob C
Abe B
Ace D E
A D
Abe F G
A
```

should return these clusters.

```javascript
{
"clusters":[
[ "A B C", "Abe Bob C", "Abe B" ],
[ "Ace D E", "A D" ],
[ "Abe F G" ],[ "A" ]]
}
```