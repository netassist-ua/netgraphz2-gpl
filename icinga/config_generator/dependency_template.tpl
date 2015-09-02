/* {hostname} -> {other_hostname} */

apply Dependency "{hostname}" to Host {
  parent_host_name = "{hostname}"
  assign where host.name == "{other_hostname}"
  disable_notifications = false
}
