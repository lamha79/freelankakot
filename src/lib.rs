#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod freelankakot {

    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    pub type JobId = u128;
    pub type ReportInfo = String;

    const FEE_PERCENTAGE: u8 = 3;

    #[ink(storage)]
    #[derive(Default)]
    pub struct Account {
        jobs: Mapping<JobId, Job>, // map jobID đến job: luôn là trạng thái cuối cùng của job, như vậy job reopen sẽ ko lưu người làm trước, phần đó lưu trong unsuccessful_job kèm đánh giá
        current_job_id: JobId,
        personal_account_info: Mapping<AccountId, UserInfo>,
        owner_jobs: Mapping<AccountId, Vec<JobId>>,
        freelancer_jobs: Mapping<AccountId, Vec<JobId>>,
        list_jobs_assign: Mapping<AccountId, (JobId, bool)>, // danh sách công việc đã giao <id,(job_id,hoàn thành hay chưa?))>
        list_jobs_take: Mapping<AccountId, (JobId, bool)>, // danh sách công việc đã nhận <id,(job_id,hoàn thành hay chưa?))>
        ratings: Mapping<AccountId, (JobId, Option<RatingPoint>)>, // <JobId: id công việc, Điểm đánh giá>
        reports: Mapping<AccountId, (JobId, Option<ReportInfo>)>, // <JobId: id công việc, Thông tin tố cáo>
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Job {
        name: String,
        description: String,
        category: Category,
        result: Option<String>,
        status: Status,
        budget: Balance,                  // ngân sách
        fee_percentage: u8,               // phần trăm tiền phí
        start_time: Timestamp,            // thời gian bắt đầu tính từ lúc khởi tạo công việc
        end_time: Timestamp, //thời gian kết thúc = thời gian bắt đầu + duration người dùng nhập sẽ tính bằng ngày. (thời gian này bao gồm khởi tạo công việc và xét duyệt quá thời hạn người tạo phải hủy job tránh tình trạng treo người làm xong ko được nghiệm thu)
        person_create: Option<AccountId>, // id người giao việc
        person_obtain: Option<AccountId>, // id người nhận việc
        pay: Balance,        // số tiền đã trả cho người làm
        feedback: String,    // phản hồi của đối tác
        request_negotiation: bool, // yêu cầu thương lượng
        requester: Option<AccountId>, // người yêu cầu thương lượng
        reporter: Option<AccountId>, // người được phép tố cáo
        require_rating: (bool, bool), // yêu cầu đánh giá của (người giao việc, người nhận việc)
        unqualifier: bool,   // smart contract phát hiện công việc không đạt chất lương (quá hạn)
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Category {
        #[default]
        IT,
        MARKETING,
        PHOTOSHOP,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum RatingPoint {
        #[default]
        OneStar,
        TwoStars,
        ThreeStars,
        FourStars,
        FiveStars,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Status {
        #[default]
        OPEN,
        DOING,
        REVIEW,
        UNQUALIFIED, //chưa đạt yêu cầu, reject => unqualifieds => freelancer nếu đồng ý thì reopen nếu ko thì complaint
        REOPEN,
        FINISH,
        CANCELED,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq, Clone, Copy)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum AccountRole {
        #[default]
        INDIVIDUAL, // khách hàng cá nhân
        ENTERPRISE(OnwerRoleInEnterprise), // khác hàng doanh nghiệp
        FREELANCER,
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, PartialEq, Clone, Copy)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum OnwerRoleInEnterprise {
        #[default]
        TEAMLEAD,
        ACCOUNTANT, //có thể bổ sung các role khác
    }

    #[derive(scale::Decode, scale::Encode, Default, Debug, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct UserInfo {
        name: String,
        detail: String,    //liên kết đến IPFS lưu trữ thông tin cá nhân
        role: AccountRole, // vai trò
        successful_jobs_and_all_jobs: (u32, u32), //số lượng công việc thành công trên số lượng công việc đã tạo (client) hoặc đã nhận (freelancer).
        rating_points: i32,                       // điểm dánh giá có thể âm nên để i32
    }

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum JobError {
        // Lỗi liên quan tới đăng kí tài khoản
        Registered,    //đã đăng kí tài khoản (đăng kí), không đăng kí nữa
        NotRegistered, // chưa đăng kí tài khoản.

        // Lỗi role
        NotJobAssigner, // bạn không phải là người giao việc
        NotFreelancer,  // bạn không phải là freelancer

        // Lỗi check job
        NotExisted,       // Job không tồn tại
        NotTaked,         // chưa có người nhận job
        Taked,            //đã có người nhận
        NotTakeThisJob,   // bạn ko có nhận job này
        NotAssignThisJob, //bạn ko phải là người giao việc này

        // Lỗi liên quan đến thời gian hoàn thành job
        OutOfDate,

        // Lỗi liên quan tới status job
        Submited,             //đã submit
        Proccessing,          //đang có người làm
        CurrentJobIncomplete, //hoàn thành job hiện tại đã
        Finish,               //job đã kết thúc (hoàn thành hoặc bị hủy)

        // Lỗi liên quan đến đánh giá và tranh chấp
        InvalidPayAmount,   //số tiền phí không hợp lệ
        InvalidNegotiation, // yêu cầu thương lượng không hợp lệ
        InvalidTermination, // yêu cầu chấm dứt không hợp lệ
        InvalidReport,      // yêu cầu tố cáo không hợp lệ
        InvalidRating,      // yêu cầu đánh giá không hợp lệ
    }

    impl Account {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self::default()
        }

        #[ink(message)]
        pub fn register(
            &mut self,
            name: String,
            detail: String,
            string_role: String,
        ) -> Result<(), JobError> {
            let caller = self.env().caller();
            let mut role: AccountRole = AccountRole::default();
            if string_role.to_lowercase() == "individual" {
                role = AccountRole::INDIVIDUAL;
            } else if string_role.to_lowercase() == "teamlead" {
                role = AccountRole::ENTERPRISE(OnwerRoleInEnterprise::TEAMLEAD);
            } else if string_role.to_lowercase() == "accountant" {
                role = AccountRole::ENTERPRISE(OnwerRoleInEnterprise::ACCOUNTANT);
            } else if string_role.to_lowercase() == "freelancer" {
                role = AccountRole::FREELANCER;
            };
            let caller_info = UserInfo {
                name: name,
                detail: detail,
                role: role,
                successful_jobs_and_all_jobs: (0, 0),
                rating_points: 0,
            };
            match self.personal_account_info.get(caller) {
                None => self.personal_account_info.insert(caller, &caller_info),
                _ => return Err(JobError::Registered),
            };
            Ok(())
        }

        // //check role tài khoản
        // #[ink(message)]
        // pub fn get_role_of(&self, account: AccountId) -> AccountRole {
        //     self.personal_account_info.get(account).unwrap().role
        // }

        //show thông tin account
        #[ink(message)]
        pub fn get_account_info(&self, caller: AccountId) -> Option<UserInfo> {
            self.personal_account_info.get(caller)
        }
        // show toàn bộ công việc của người tạo
        #[ink(message)]
        pub fn get_job_id_of_onwer(&self, owner: AccountId) -> Option<Vec<JobId>> {
            self.owner_jobs.get(owner)
        }
        //show toàn bộ công việc của người nhận
        #[ink(message)]
        pub fn get_job_id_of_freelancer(&self, owner: AccountId) -> Option<Vec<JobId>> {
            self.freelancer_jobs.get(owner)
        }

        //show chi tiết công việc
        #[ink(message)]
        pub fn show_detail_job_of_id(&self, job_id: JobId) -> Option<Job> {
            self.jobs.get(job_id)
        }

        #[ink(message, payable)]
        pub fn create(
            &mut self,
            name: String,
            description: String,
            string_category: String,
            duration: u64,
        ) -> Result<(), JobError> {
            //duration là nhập số ngày chú ý timestamp tính theo mili giây
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let budget = self.env().transferred_value()* (100 - FEE_PERCENTAGE as u128) / 100;
            let start_time = self.env().block_timestamp();
            let mut category = Category::default();
            if string_category.to_lowercase() == "it" {
                category = Category::IT;
            } else if string_category.to_lowercase() == "marketing" {
                category = Category::MARKETING;
            } else if string_category.to_lowercase() == "photoshop" {
                category = Category::PHOTOSHOP;
            };
            let job = Job {
                name: name,
                description: description,
                category: category,
                result: None,
                status: Status::default(),
                budget: budget,
                pay: budget,
                fee_percentage: FEE_PERCENTAGE,
                start_time: start_time,
                end_time: start_time + duration * 24 * 60 * 60 * 1000,
                person_create: Some(caller),
                person_obtain: None,
                feedback: String::new(),
                request_negotiation: false,
                requester: None,
                reporter: None,
                require_rating: (false, false),
                unqualifier: false,
            };
            let current_id = self.current_job_id;
            self.jobs.insert(current_id, &job);
            // update owner_jobs
            match self.owner_jobs.contains(caller) {
                true => {
                    let mut jobs_of_caller = self.owner_jobs.get(caller).unwrap();
                    jobs_of_caller.push(current_id);
                    self.owner_jobs.insert(caller, &jobs_of_caller);
                }
                false => {
                    let mut jobs_of_caller = Vec::new();
                    jobs_of_caller.push(current_id);
                    self.owner_jobs.insert(caller, &jobs_of_caller);
                }
            }
            self.current_job_id = current_id + 1;
            //update user_info chỗ successful_jobs_and_all_jobs: all_jobs tăng thêm 1
            let mut owner_detail = caller_info.unwrap();
            owner_detail.successful_jobs_and_all_jobs.1 =
                owner_detail.successful_jobs_and_all_jobs.1 + 1;
            self.personal_account_info.insert(caller, &owner_detail);
            Ok(())
        }

        // có thể tùy chỉnh thêm lọc công việc theo status hoặc theo owner hoặc theo freelancer
        // lọc theo owner khi 1 owner có thể tạo nhiều công việc (chưa làm)
        // freelancer có thể apply job open va reopen
        #[ink(message)]
        pub fn get_jobs_with_status(&self, status: Status) -> Vec<Job> {
            let mut jobs = Vec::new();
            for index in 0..self.current_job_id {
                let job = self.jobs.get(index).unwrap();
                if job.status == status {
                    jobs.push(self.jobs.get(index).unwrap());
                }
            }
            jobs
        }

        #[ink(message)]
        pub fn obtain(&mut self, job_id: JobId) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role != AccountRole::FREELANCER {
                        return Err(JobError::NotFreelancer);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            //check end_time
            if job.end_time < self.env().block_timestamp() {
                return Err(JobError::OutOfDate);
            };

            match job.status {
                Status::DOING => return Err(JobError::Proccessing),
                Status::REVIEW | Status::UNQUALIFIED => return Err(JobError::Submited),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::OPEN | Status::REOPEN => {
                    //update lại thông tin job
                    job.status = Status::DOING;
                    job.person_obtain = Some(caller);
                    //update công việc của freelancer
                    match self.freelancer_jobs.contains(caller) {
                        true => {
                            let mut jobs_of_caller = self.freelancer_jobs.get(caller).unwrap();
                            jobs_of_caller.push(job_id);
                            self.freelancer_jobs.insert(caller, &jobs_of_caller);
                        }
                        false => {
                            let mut jobs_of_caller = Vec::new();
                            jobs_of_caller.push(job_id);
                            self.freelancer_jobs.insert(caller, &jobs_of_caller);
                        }
                    }
                    //update user_info chỗ successful_jobs_and_all_jobs: all_jobs tăng thêm 1
                    let mut freelancer_detail = caller_info.unwrap();
                    freelancer_detail.successful_jobs_and_all_jobs.1 =
                        freelancer_detail.successful_jobs_and_all_jobs.1 + 1;
                    self.personal_account_info
                        .insert(caller, &freelancer_detail);
                    self.jobs.insert(job_id, &job);
                }
            }
            Ok(())
        }

        #[ink(message)]
        pub fn submit(&mut self, job_id: JobId, result: String) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role != AccountRole::FREELANCER {
                        return Err(JobError::NotFreelancer);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Check job đó có phải của mình nhận hay không
            if job.person_obtain.unwrap() != caller {
                return Err(JobError::NotTakeThisJob);
            };
            // Check job status
            match job.status {
                // Status::OPEN | Status::REOPEN => return Err(JobError::NotTakeThisJob), // không thể xảy ra vì job đã của freelance
                Status::REVIEW | Status::UNQUALIFIED => return Err(JobError::Submited),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::DOING => {
                    // Update lại thông tin job
                    // Check job is expired
                    job.unqualifier = job.end_time < self.env().block_timestamp();
                    job.result = Some(result);
                    job.status = Status::REVIEW;
                    self.jobs.insert(job_id, &job);
                }
                _ => (),
            }

            Ok(())
        }

        #[ink(message)]
        pub fn reject(&mut self, job_id: JobId) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            //check job đó có phải của mình giao hay không
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            match job.status {
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED => return Err(JobError::Proccessing),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::REVIEW => {
                    //update lại thông tin job để freelancer biết chưa hài lòng
                    job.status = Status::UNQUALIFIED;
                    self.jobs.insert(job_id, &job);
                }
            }
            Ok(())
        }
        #[ink(message, payable)]
        pub fn aproval(&mut self, job_id: JobId) -> Result<(), JobError> {
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            //check end_time
            //check job đó có phải của mình hay không
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            match job.status {
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED => return Err(JobError::Proccessing),
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
                Status::REVIEW => {
                    //update lại thông tin job
                    job.status = Status::FINISH;
                    job.require_rating = (true, true);
                    //update user_info chỗ công việc thành công của owner tăng thêm 1
                    let mut owner_detail = caller_info.unwrap();
                    owner_detail.successful_jobs_and_all_jobs.0 =
                        owner_detail.successful_jobs_and_all_jobs.0 + 1;
                    self.personal_account_info.insert(caller, &owner_detail);
                    //update user_info chỗ công việc hoàn thành của freelancer tăng thêm 1
                    let freelancer = job.person_obtain.unwrap();
                    let mut freelancer_detail = self.personal_account_info.get(freelancer).unwrap();
                    freelancer_detail.successful_jobs_and_all_jobs.0 =
                        freelancer_detail.successful_jobs_and_all_jobs.0 + 1;
                    self.personal_account_info
                        .insert(freelancer, &freelancer_detail);
                    //khởi tạo job thành công, nội dung đánh giá sẽ do raiting làm
                    self.list_jobs_assign
                        .insert(job.person_create.unwrap(), &(job_id, true));
                    self.list_jobs_take
                        .insert(job.person_obtain.unwrap(), &(job_id, true));
                    // chuyển tiền và giữ lại phần trăm phí
                    // let budget = job.budget * (100 - FEE_PERCENTAGE as u128) / 100;
                    let _ = self.env().transfer(freelancer, job.pay);
                    self.jobs.insert(job_id, &job);
                }
            }
            Ok(())
        }

        #[ink(message, payable)]
        pub fn cancel(&mut self, job_id: JobId) -> Result<(), JobError> {
            // Khách hàng có thể huỷ job nếu job ở trạng thái OPEN hoặc REOPEN hoặc UNQUALIFIED mà hết thời gian job, nếu job đã được giao thì không thể huỷ, budget của job sẽ được trả lại cho người giao job đó.
            // Retrieve job
            // let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // // Check caller is job owner ?
            // let caller = self.env().caller();
            // if self.owner_jobs.get(caller).unwrap().contains(&job_id) {
            //         return Err(JobError::NotAssignThisJob)
            // }
            let caller = self.env().caller();
            let caller_info = self.personal_account_info.get(caller);
            // kiểm tra đăng kí và role
            match caller_info.clone() {
                None => return Err(JobError::NotRegistered), //check đăng kí chưa
                Some(user_info) => {
                    //check role đúng chưa
                    if user_info.role == AccountRole::FREELANCER {
                        return Err(JobError::NotJobAssigner);
                    }
                }
            }
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;

            //check job đó có phải của mình hay không
            if job.person_create.unwrap() != caller {
                return Err(JobError::NotAssignThisJob);
            };
            // Only allow cancel if status is OPEN or REOPEN
            match job.status {
                Status::OPEN | Status::REOPEN => {
                    // Set status to canceled
                    job.status = Status::CANCELED;
                    // Update job in storage
                    // trả tiền
                    // let budget = job.budget * (100 - FEE_PERCENTAGE as u128) / 100; // chuyển tiền và giữ lại phần trăm phí tạo việc
                    let _ = self.env().transfer(job.person_create.unwrap(), job.budget);
                    self.list_jobs_assign
                        .insert(job.person_create.unwrap(), &(job_id, false));

                    self.jobs.insert(job_id, &job);
                }
                Status::DOING | Status::REVIEW | Status::UNQUALIFIED => {
                    return Err(JobError::Proccessing)
                }
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish), // job đã bị hủy hoặc finish
            }
            Ok(())
        }

        #[ink(message)]
        pub fn request_negotiate(
            &mut self,
            job_id: JobId,
            feedback: String,
            pay: u128,
        ) -> Result<(), JobError> {
            // Gửi yêu cầu thương lượng tới phía đối tác, người gửi setup mức giá mong muốn cho công việc đã submit
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            let caller = self.env().caller();
            // Retrieve caller info
            let caller_info = self.personal_account_info.get(&caller);
            // Validate caller is registered
            let caller_info = caller_info.ok_or(JobError::NotRegistered)?;
            // Caller is a freelancer?
            if caller_info.role != AccountRole::FREELANCER {
                if job.person_create.unwrap() != caller {
                    return Err(JobError::NotAssignThisJob);
                }
            } else {
                // Validate caller is assigned the job
                if job.person_obtain.unwrap() != caller {
                    return Err(JobError::NotTakeThisJob);
                }
            }
            // Add validation for pay amount
            match pay {
                i if (i > 0 && i < job.budget) => {
                    // Validate job status
                    match job.status {
                        Status::UNQUALIFIED => {
                            // Send negotiation request
                            if job.request_negotiation == false {
                                job.pay = pay;
                                job.request_negotiation = true;
                                job.feedback = feedback;
                                job.requester = Some(caller);
                                self.jobs.insert(job_id, &job);
                            } else {
                                return Err(JobError::InvalidNegotiation);
                            }
                        }
                        Status::OPEN | Status::REOPEN => return Err(JobError::NotAssignThisJob),
                        Status::DOING | Status::REVIEW => return Err(JobError::Proccessing),
                        Status::CANCELED | Status::FINISH => return Err(JobError::NotExisted),
                    }
                }
                _ => return Err(JobError::InvalidPayAmount),
            }
            Ok(())
        }

        #[ink(message, payable)]
        pub fn respond_negotiate(
            &mut self,
            job_id: JobId,
            agreement: bool,
        ) -> Result<(), JobError> {
            // Phản hồi thương lượng từ phía gửi, người nhận yêu cầu lựa chọn đồng ý hoặc không đồng ý với yêu cầu này
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            let caller = self.env().caller();
            // Retrieve caller info
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            match job.requester.unwrap() {
                i if i == job.person_create.unwrap() => {
                    if caller != job.person_obtain.unwrap() {
                        return Err(JobError::NotTakeThisJob);
                    }
                }
                i if i == job.person_obtain.unwrap() => {
                    if caller != job.person_create.unwrap() {
                        return Err(JobError::NotAssignThisJob);
                    }
                }
                _ => return Err(JobError::NotTaked),
            }

            match job.status {
                Status::UNQUALIFIED => {
                    if job.request_negotiation {
                        if agreement {
                            job.status = Status::FINISH;
                            // Update job in storage
                            // Transfer funds
                            let _ = self.env().transfer(job.person_obtain.unwrap(), job.pay);
                            let _ = self
                                .env()
                                .transfer(job.person_create.unwrap(), job.budget - job.pay);
                            self.list_jobs_assign
                                .insert(job.person_create.unwrap(), &(job_id, true));
                            self.list_jobs_take
                                .insert(job.person_obtain.unwrap(), &(job_id, true));
                            self.jobs.insert(job_id, &job);
                        } else {
                            // If respond is don't agree
                            job.request_negotiation = false;
                            job.requester = None;
                            job.pay = job.budget;
                            self.jobs.insert(job_id, &job);
                        }
                    } else {
                        return Err(JobError::InvalidNegotiation);
                    }
                }
                Status::OPEN | Status::REOPEN => return Err(JobError::NotAssignThisJob),
                Status::DOING | Status::REVIEW => return Err(JobError::Proccessing),
                Status::CANCELED | Status::FINISH => return Err(JobError::NotExisted),
            }
            Ok(())
        }

        #[ink(message, payable)]
        pub fn terminate(&mut self, job_id: JobId) -> Result<(), JobError> {
            // Trong trường hợp bên nào đó không muốn tiếp tục thương lượng có thể chấm dứt hợp đồng bất cứ lúc nào. Nếu lý do chấm dứt hợp đồng hợp lý (quá hạn công việc), bên bị chấm dứt không có quyền tố cáo. Nếu yêu cầu chấm dứt hợp đồng không hợp lý, người bị chấm dứt có quyền tố cáo đối tác
            // Retrieve the job from storage
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Get the caller's address
            let caller = self.env().caller();
            // Retrieve caller info
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            // Check job is expired
            job.unqualifier = job.end_time < self.env().block_timestamp();
            // Handle different status cases
            match job.status {
                // If the job is in the OPEN or REOPEN status, return error not take this job
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTakeThisJob),
                // If the job is in the UNQUALIFIED status
                Status::UNQUALIFIED | Status::DOING | Status::REVIEW => {
                    // Check if the caller and qualifier of job
                    match (caller, job.unqualifier) {
                        (a, b) if (a == job.person_create.unwrap() && b) => job.reporter = None,
                        (a, b) if (a == job.person_create.unwrap() && !b) => {
                            job.reporter = job.person_obtain
                        }
                        (a, b) if (a == job.person_obtain.unwrap() && b) => {
                            job.reporter = job.person_create
                        }
                        (a, b) if (a == job.person_obtain.unwrap() && !b) => job.reporter = None,
                        _ => return Err(JobError::InvalidTermination),
                    }
                    // Update history jobs
                    self.list_jobs_take
                        .insert(job.person_obtain.unwrap(), &(job_id, false));
                    // Set the job status to REOPEN
                    job.status = Status::REOPEN;
                    job.pay = job.budget;
                    job.person_obtain = None;
                    self.jobs.insert(job_id, &job);
                }
                // If the job is in the CANCELED or FINISH status, return an error
                Status::CANCELED | Status::FINISH => return Err(JobError::Finish),
            }
            Ok(())
        }

        #[ink(message)]
        pub fn report(&mut self, job_id: JobId, report: ReportInfo) -> Result<(), JobError> {
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Get the caller's address
            let caller = self.env().caller();
            // Retrieve caller info validate that the caller is registered
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            match caller {
                x if x == job.reporter.unwrap() => {
                    job.reporter = None;
                    self.jobs.insert(job_id, &job);
                    self.list_jobs_take
                        .insert(job.person_obtain.unwrap(), &(job_id, false));

                    match x {
                        y if y == job.person_create.unwrap() => {
                            self.reports
                                .insert(job.person_obtain.unwrap(), &(job_id, Some(report)));
                        }
                        y if y == job.person_obtain.unwrap() => {
                            self.reports
                                .insert(job.person_create.unwrap(), &(job_id, Some(report)));
                        }
                        _ => return Err(JobError::InvalidReport),
                    }
                }
                _ => return Err(JobError::InvalidReport),
            }
            Ok(())
        }

        #[ink(message)]
        pub fn rating(&mut self, job_id: JobId, rating_point: RatingPoint) -> Result<(), JobError> {
            let mut job = self.jobs.get(job_id).ok_or(JobError::NotExisted)?;
            // Get the caller's address
            let caller = self.env().caller();
            // Retrieve caller info and validate that the caller is registered
            let _caller_info = self
                .personal_account_info
                .get(&caller)
                .ok_or(JobError::NotRegistered)?;
            match job.status {
                Status::OPEN | Status::REOPEN => return Err(JobError::NotTaked),
                Status::DOING | Status::UNQUALIFIED | Status::REVIEW => {
                    return Err(JobError::Proccessing)
                }
                Status::CANCELED => return Err(JobError::NotExisted),
                Status::FINISH => match (caller, job.require_rating) {
                    (a, (b, _)) if (a == job.person_create.unwrap() && b) => {
                        job.require_rating.0 = false;
                        self.ratings
                            .insert(job.person_obtain.unwrap(), &(job_id, Some(rating_point)));
                        self.jobs.insert(job_id, &job);
                    }
                    (a, (_, c)) if (a == job.person_obtain.unwrap() && c) => {
                        job.require_rating.1 = true;
                        self.ratings
                            .insert(job.person_create.unwrap(), &(job_id, Some(rating_point)));
                        self.jobs.insert(job_id, &job);
                    }
                    _ => return Err(JobError::InvalidRating),
                },
            }
            Ok(())
        }
    }

    // viết test
    #[cfg(test)]
    mod tests {

        #[ink::test]
        fn new_works() {
            // let mut new_freelancer = Freelancer::new();
            // assert_eq!(new_freelancer.current_job_id, 0);

            // // role cá nhân hoặc role doanh nghiệp
            // let individual_role = OnwerRole::INDIVIDUAL;
            // // let enterprise_role =OnwerRole::ENTERPRISE(OnwerRoleInEnterprise::TEAMLEAD);

            // new_freelancer.create("TaskOne".to_string(), "Submit on one week".to_string(), individual_role);
            // assert_eq!(new_freelancer.current_job_id, 1);
            // assert_eq!(new_freelancer.jobs.get(1).unwrap().name, "TaskOne".to_string());
            // assert_eq!(new_freelancer.jobs.get(1).unwrap().description, "Submit on one week".to_string());
            // assert_eq!(new_freelancer.jobs.get(1).unwrap().result, None);
            // assert_eq!(new_freelancer.jobs.get(1).unwrap().status, Status::OPEN);
            // assert_eq!(new_freelancer.jobs.get(1).unwrap().budget, 0); //buget khi đưa vào mặc định là 0
        }
    }
}
