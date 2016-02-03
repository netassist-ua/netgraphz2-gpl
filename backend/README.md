# NetGraphz2 backend
Collects information about states and metric from different sources. 
Applies graph information, caches information about network state.
Used to keep information about network in actual state, show latest available information from network sensors in case if some service goes down.

Backend consists of two parts:
-   NG_State - NetGraphz2 state service: provides latest state information about hosts and services
-   NG_Metric - NetGraphz2 metric service: provides latest metric information on hosts from metric monitoring applications or metric databases

Backend is implemented on Golang.
