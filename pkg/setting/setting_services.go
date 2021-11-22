package setting

type ServiceSettings struct {
	Reader       string
	Writer       string
	Notification string
	Report       string
}

func (cfg *Cfg) readServiceSettings() {
	sec := cfg.Raw.Section("microservices")
	cfg.Service.Reader = sec.Key("reader_url").String()
	cfg.Service.Writer = sec.Key("writer_url").String()
	cfg.Service.Notification = sec.Key("notification_url").String()
	cfg.Service.Report = sec.Key("report_url").String()
}
